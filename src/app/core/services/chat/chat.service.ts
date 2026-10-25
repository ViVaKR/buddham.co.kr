import { computed, inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IChatMessage } from '@app/core/interfaces/chat/i-chat-message';
import { IChatUser } from '@app/core/interfaces/chat/i-chat-user';
import { SignOutService } from '@app/core/services/auth/sign-out.service';
import { TokenService } from '@app/core/services/auth/token.service';
import { TokenStorage } from '@app/core/services/auth/token.storage';
import { UserStore } from '@app/core/services/auth/user.store';
import { BaseService } from '@app/core/services/base/base.service';
import { ChatEventService } from '@app/core/services/chat/chat-event.service';
import { ChatStoreService } from '@app/core/services/chat/chat-store.service';
import { ChatMethod } from '@app/shared/constants/chat.constants';
import { HttpTransportType, HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { catchError, firstValueFrom, of, timeout } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Service()
export class ChatService extends BaseService {

  private store = inject(ChatStoreService);
  private events = inject(ChatEventService);
  private userStore = inject(UserStore);
  private tokenStorage = inject(TokenStorage);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private signOutService = inject(SignOutService);

  user = computed(() => this.userStore.user());

  // 상태 관리 Signal
  public readonly connectionState = signal<HubConnectionState>(HubConnectionState.Disconnected);
  public isConnected = computed(() => this.connectionState() === HubConnectionState.Connected);

  // 사용자 정보 리스너
  private hubConnection: HubConnection | null = null;
  private connectionPromise?: Promise<void>;

  // 끊김 제어 관련 멤버
  private intentionalDisconnect = false;
  private healthCheckTimer?: ReturnType<typeof setInterval>;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private retryCount = 0;
  private readonly HEALTH_CHECK_INTERVAL = 30_000;
  private readonly MAX_RETRY_ATTEMPTS = 5;
  constructor() {
    super();
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.disconnect());
    }
  }
  // ==================== [핵심] 단일 진입점: 서버 연결 ====================
  public async connect(): Promise<void> {
    const user = this.currentUser;
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }
    this.intentionalDisconnect = false;
    if (this.connectionState() === HubConnectionState.Connected) {
      return;
    }
    if (this.connectionPromise) {
      return this.connectionPromise;
    }
    this.connectionPromise = this.doConnect();
    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = undefined;
    }
  }
  // ==================== 서버 연결 해제 ====================
  public async disconnect(): Promise<void> {
    this.intentionalDisconnect = true;
    this.stopTimers();
    if (this.hubConnection && this.hubConnection.state !== HubConnectionState.Disconnected) {
      try {
        await this.hubConnection.stop();
      } catch (err) {
        console.error('SignalR 연결 종료 중 오류:', err);
      }
    }

    this.events.unregisterEvents();
    this.connectionState.set(HubConnectionState.Disconnected);
    this.store.reset();
  }
  // ==================== 내부 커넥션 생성 및 연결 시도 ====================
  private async doConnect(): Promise<void> {
    if (!this.hubConnection) {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(`${this.chatUrl}/ChatHub`, {
          accessTokenFactory: async () => this.getAccessToken(),
          skipNegotiation: false,
          transport: HttpTransportType.WebSockets | HttpTransportType.ServerSentEvents
        })
        .configureLogging(LogLevel.Information)
        .build();
      this.setupConnectionLifecyle();
    }
    try {
      this.connectionState.set(HubConnectionState.Connecting);
      await this.hubConnection.start();

      this.connectionState.set(HubConnectionState.Connected);
      this.retryCount = 0;

      // 전역 이벤트 리스너 바인딩
      this.events.registerGlobalEvents();

      this.startHealthCheck();
    } catch (err) {
      this.connectionState.set(HubConnectionState.Disconnected);
      throw err;
    }
  }

  // ==================== SignalR 생명주기 핸들러 ====================
  private setupConnectionLifecyle(): void {
    if (!this.hubConnection) return;
    this.hubConnection.onclose((error) => {
      this.connectionState.set(HubConnectionState.Disconnected);
      if (this.intentionalDisconnect) {
        this.stopTimers();
        this.store.systemMessage.set('서버 연결이 종료되었습니다.');
        return;
      }
      if (this.isAuthError(error)) {
        this.handleAuthFailure();
        return;
      }
      // 비정상 연결 해제 시 재연결 대기열 시작
      this.store.systemMessage.set('재연결을 시도합니다...');
      this.startReconnectTimer();
    });
  }

  // ==================== API 호출 및 연결 강제성 보장 헬퍼 ====================
  public async ensureConnected(): Promise<void> {
    if (this.isConnected()) return;
    await this.connect();
  }

  private get hub(): HubConnection {
    if (!this.hubConnection) {
      throw new Error('SignalR Hub가 초기화되지 않았습니다. connect()를 먼저 호출하세요.');
    }
    return this.hubConnection;
  }

  // ==================== 방 관리 API ====================
  async getRooms(): Promise<void> {
    await this.ensureConnected();
    await this.hub.invoke(ChatMethod.GetRooms);
  }
  async getRoomInfo(roomId: string): Promise<void> {
    await this.ensureConnected();
    await this.hub.invoke(ChatMethod.ReceiveRoomInfo, roomId);
  }
  async createRoom(request: any): Promise<void> {
    await this.ensureConnected();
    await this.hub.invoke(ChatMethod.CreateRoom, request.roomName, request.description);
  }
  async deleteRoom(roomId: string): Promise<boolean> {
    await this.ensureConnected();
    return await this.hub.invoke<boolean>(ChatMethod.DeleteRoom, roomId);
  }
  async joinRoom(roomId: string): Promise<boolean> {
    await this.ensureConnected();
    return await this.hub.invoke<boolean>(ChatMethod.JoinRoom, roomId);
  }
  async leaveRoom(roomId: string): Promise<void> {
    await this.ensureConnected();
    await this.hub.invoke(ChatMethod.LeaveRoom, roomId);
  }
  // ==================== 메시지 API ====================
  async sendMessage(roomId: string, content: string): Promise<void> {
    await this.ensureConnected();
    const usr = this.currentUser;
    if (!usr) throw new Error('사용자 정보가 없습니다.');
    if (!roomId || !content) throw new Error('방 번호 또는 내용이 없습니다.');
    const msg: IChatMessage = {
      id: uuidv4(),
      roomId: roomId,
      userId: usr.userId,
      userName: usr.userName,
      avatar: usr.avatar,
      content: content,
      sentAt: new Date()
    };
    await this.hub.invoke(ChatMethod.SendMessage, msg);
  }

  async loadMessageHistory(roomId: string, page: number = 1, pageSize: number = 100): Promise<void> {
    await this.ensureConnected();
    try {
      await this.hub.invoke(ChatMethod.GetRoomMessages, roomId, page, pageSize);
    } catch (err: any) {
      console.error('메시지 로드 실패:', err);
    }
  }

  // ChatStoreService.ts 내부에 추가
  updateLastMessageContent(roomId: string, token: string) {
    this.store.messageByRoom.update(map => {
      const messages = map.get(roomId) || [];
      if (messages.length === 0) return map;

      const updated = [...messages];
      const lastIndex = updated.length - 1;
      updated[lastIndex] = {
        ...updated[lastIndex],
        content: updated[lastIndex].content + token
      };

      map.set(roomId, updated);
      return new Map(map);
    });
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.ensureConnected();
    await this.hub.invoke(ChatMethod.DeleteMessage, messageId);
  }
  // ==================== 참여자 API ====================
  async getRoomParticipants(roomId: string): Promise<void> {
    await this.ensureConnected();
    await this.hub.invoke(ChatMethod.GetRoomParticipants, roomId);
  }
  async getPseudonymName(): Promise<string> {
    if (this.intentionalDisconnect || !this.isConnected()) {
      return '게스트';
    }
    try {
      await this.ensureConnected();
      return await this.hub.invoke(ChatMethod.GetPseudonymName);
    } catch {
      return '게스트';
    }
  }
  // ==================== 타이머 및 헬스 체크 ====================
  private startHealthCheck(): void {
    this.stopHealthCheck();
    this.healthCheckTimer = setInterval(async () => {
      if (this.intentionalDisconnect) {
        this.stopHealthCheck();
        return;
      }
      if (this.connectionState() === HubConnectionState.Disconnected) {
        this.alertService.openSheet([{ title: '연결끊김', content: '재연결을 시도합니다...' }]);
        try {
          await this.connect();
        } catch (err: any) {
          this.alertService.openSheet([{ title: '재연결 실패', content: err?.message || '네트워크 상태를 확인해주세요.' }]);
        }
      }
    }, this.HEALTH_CHECK_INTERVAL);
  }
  private stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }
  private startReconnectTimer(): void {
    if (this.intentionalDisconnect) return;
    if (this.retryCount >= this.MAX_RETRY_ATTEMPTS) {
      console.error('❌ 최대 재연결 시도 초과 - 로그아웃 처리');
      this.handleAuthFailure();
      return;
    }
    this.stopReconnectTimer();
    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30_000);
    this.reconnectTimer = setTimeout(async () => {
      if (this.intentionalDisconnect) return;
      try {
        await this.connect();
      } catch {
        this.retryCount++;
        this.startReconnectTimer();
      }
    }, delay);
  }
  private stopReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }
  private stopTimers(): void {
    this.stopHealthCheck();
    this.stopReconnectTimer();
  }
  // ==================== 인증 및 액세스 토큰 취득 헬퍼 ====================
  private async getAccessToken(): Promise<string> {
    let token = this.tokenStorage.getAccessToken();
    if (!token) return '';
    if (this.isTokenExpiringSoon(token)) {
      try {
        const result = await firstValueFrom(
          this.tokenService.refreshToken().pipe(
            timeout(5_000),
            catchError(() => of(null))
          )
        );
        if (result?.isSuccess && result.content?.token) {
          token = result.content.token;
        } else {
          this.alertService.openSheet([{ title: '토큰 갱신 실패', content: '로그인 세션이 만료되었습니다.' }]);
        }
      } catch {
        this.alertService.openSheet([{ title: '토큰 갱신 실패', content: '서버와 통신할 수 없습니다.' }]);
      }
    }
    return token || '';
  }
  private isTokenExpiringSoon(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 - Date.now() < 5 * 60 * 1000;
    } catch {
      return false;
    }
  }
  private isAuthError(error: Error | undefined): boolean {
    return !!(error?.message?.includes('401') || error?.message?.includes('Unauthorized'));
  }
  private handleAuthFailure(): void {
    this.signOutService.clearAll();
    this.router.navigate(['']);
  }
  // ==================== GETTER / 정보 추출 ====================
  public get currentUser(): IChatUser | null {
    const user = this.user();
    if (!user) return null;
    return {
      userId: user.id,
      userName: user.pseudonym,
      avatar: user.avatar ?? 'default.png'
    };
  }
  ngOnDestroy(): void {
    this.disconnect();
  }
}
