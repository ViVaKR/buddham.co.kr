import { inject, Service, signal } from '@angular/core';
import { TokenStorage } from '@app/core/services/auth/token.storage';
import { IChatEvent, IChatPayload } from '@app/pages/chat/interfaces/i-chat';
import { environment } from '@env/environment';
import * as signalR from '@microsoft/signalr';

interface SavedSession { site: string; room: string | null; }

export type ChatStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

@Service()
export class ChatKarmaService {
  private readonly tokens = inject(TokenStorage);
  private readonly STORAGE_KEY = 'chat-karma:session';
  private site = '';

  readonly joinedRoom = signal<string | null>(null); // rooms Set 대신 통일
  private hubUrl = environment.api.hubUrl;
  private connection?: signalR.HubConnection;
  readonly status = signal<ChatStatus>('disconnected');
  readonly messages = signal<IChatPayload[]>([]);
  readonly events = signal<IChatEvent[]>([]);
  readonly error = signal<string | null>(null);

  async connect(site: string): Promise<void> {

    if (this.connection) await this.disconnect();

    this.error.set(null);
    this.status.set('connecting')

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${this.hubUrl}?site=${encodeURIComponent(site)}`, {
        accessTokenFactory: () => this.tokens.getAccessToken() ?? ''
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // 서버 -> 클라이언트 (IChatClient)
    conn.on('ReceiveMessage', (m: IChatPayload) => this.messages.update(list => [...list, m]));
    conn.on('UserJoined', (room: string, user: string) => this.pushEvent('join', room, user));
    conn.on('UserLeft', (room: string, user: string) => this.pushEvent('leave', room, user));

    conn.onreconnecting(() => this.status.set('reconnecting'));

    // 재연결시 새 ConnectionId 라서 방 멤버십이 사라짐 -> 다시 Join
    conn.onreconnected(async () => {
      this.status.set('connected');
      const room = this.joinedRoom();
      try { await this.loadHistory(room!); } catch (e) { this.fail(e) }

    });

    conn.onclose(() => {
      this.status.set('disconnected');
      this.joinedRoom.set(null); // 저장값은 유지, 새로고침하면 복원 시도
    });

    try {
      await conn.start();
      this.connection = conn;
      this.site = site;
      this.status.set('connected');
      this.persist();
    } catch (e) {
      this.status.set('disconnected');
      this.fail(e);
    }
  }

  async join(room: string): Promise<void> {
    this.error.set(null);

    try {
      await this.loadHistory(room);
      this.joinedRoom.set(room);
      this.persist();
    } catch (e) {
      this.fail(e);
    }
  }
  async send(room: string, text: string): Promise<void> {
    try {
      await this.connection?.invoke('SendMessage', room, text);
    } catch (e) {
      this.fail(e);
    }
  }
  async leave(): Promise<void> {
    const room = this.joinedRoom();
    if (!room) return;
    try {
      await this.connection?.invoke('Leave', room);
      this.joinedRoom.set(null);
      this.persist();
    } catch (e) {
      this.fail(e);
    }
  }

  private async loadHistory(room: string): Promise<void> {
    const history = await this.connection!.invoke<IChatPayload[]>('Join', room);
    this.messages.update(list => [...list.filter(m => m.room !== room), ...history]);
  }

  private pushEvent(kind: IChatEvent['kind'], room: string, user: string): void {
    this.events.update(list => [...list, { kind, room, user, at: new Date() }].slice(-50))
  }

  // HubException 메시지는 서버에서 던진 문구가 그대로 담겨 옴
  private fail(e: unknown): void {
    this.error.set(e instanceof Error ? e.message : String(e));
  }

  // ===== 저장/복원 =====
  private persist(): void {
    try {
      const data: SavedSession = { site: this.site, room: this.joinedRoom() };
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch { /* 저장 실패는 무시 */ }
  }

  private load(): SavedSession | null {
    try {
      const raw = sessionStorage.getItem(this.STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SavedSession) : null;
    } catch { return null; }
  }

  private clearSaved(): void {
    try { sessionStorage.removeItem(this.STORAGE_KEY); } catch { }
  }

  /** 새로고침/재진입 시 호출: 저장된 세션이 있으면 재연결 + 재입장 */
  async restore(): Promise<SavedSession | null> {
    const saved = this.load();
    if (!saved) return null;

    if (this.status() === 'disconnected') {
      await this.connect(saved.site);
      if (this.status() !== 'connected') return null;
      if (saved.room) await this.join(saved.room);
    }
    return { site: this.site, room: this.joinedRoom() };
  }

  async disconnect(): Promise<void> {
    await this.connection?.stop();
    this.connection = undefined;
    this.joinedRoom.set(null);
    this.messages.set([]);
    this.events.set([]);
    this.status.set('disconnected');
    this.clearSaved(); // 사용자가 집접 끊으면 저장 정보 삭제
  }
}
