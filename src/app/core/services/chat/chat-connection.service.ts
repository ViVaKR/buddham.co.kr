import { inject, Service, signal } from '@angular/core';
import { SignOutService } from '@app/core/services/auth/sign-out.service';
import { TokenService } from '@app/core/services/auth/token.service';
import { TokenStorage } from '@app/core/services/auth/token.storage';
import { BaseService } from '@app/core/services/base/base.service';
import { Paths } from '@app/data/menu-data';
import {
  HttpTransportType,
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel
} from '@microsoft/signalr';
import {
  catchError,
  defaultIfEmpty,
  firstValueFrom,
  of,
  timeout
} from 'rxjs';

@Service()
export class ChatConnectionService extends BaseService {

  private connection!: HubConnection;
  private initialized = signal<boolean>(false);
  private readonly tokenStorage = inject(TokenStorage);
  private readonly tokenService = inject(TokenService);
  private readonly logoutService = inject(SignOutService);
  public readonly state = signal<HubConnectionState>(HubConnectionState.Disconnected);
  private intentionalDisconnect = signal<boolean>(false);

  constructor() {
    super();
    window.addEventListener('beforeunload', () => this.disconnect())
  }

  // ==================== 허브 초기화 ====================
  public async init(url: string): Promise<void> {
    if (this.initialized()) return;
    this.connection = new HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: async () => this.getAccessToken(),
        skipNegotiation: false,
        transport: HttpTransportType.WebSockets | HttpTransportType.ServerSentEvents
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect([0, 2_000, 5_000, 10_000, 10_000, 10_000]) // 💡 자동 재연결 무기 장착!
      .build();

    this.setupEventHandlers();

    this.initialized.set(true);
  }

  // ==================== 이벤트 핸들러 ====================

  private setupEventHandlers(): void {

    this.connection.onreconnecting((error) => {
      this.state.set(HubConnectionState.Reconnecting);
      // 필요하면 여기서 "재연결 중..." 배너
    });

    this.connection.onreconnected((connectionId) => {
      this.state.set(HubConnectionState.Connected);
    });

    this.connection.onclose((error) => {
      this.state.set(HubConnectionState.Disconnected);

      // 의도적인 연결 끊기시
      if (this.intentionalDisconnect()) {
        return;
      }

      // 인증실패
      if (this.isAuthError(error)) {
        this.handleAuthFailure();
        return;
      }
      // 그 외엔 그냥 둠 — withAutomaticReconnect 재시도 배열 다 소진된 후에만 여기 옴
    });
  }

  // ==================== 연결 관리 ====================
  async connect(): Promise<void> {

    if (!this.initialized()) {
      throw new Error('초기화 되지 않았습니다.');
    }

    this.intentionalDisconnect.set(false);
    if (this.connection.state == HubConnectionState.Connected) return;

    try {
      this.state.set(HubConnectionState.Connecting);
      await this.connection.start();
      this.state.set(HubConnectionState.Connected);
    } catch (err) {
      this.state.set(HubConnectionState.Disconnected);
      throw err;
    }
  }

  async disconnect(): Promise<void> {

    this.intentionalDisconnect.set(true);
    if (this.connection?.state !== HubConnectionState.Disconnected) {
      try {
        await this.connection.stop();
      } catch { }
    }
    this.state.set(HubConnectionState.Disconnected);
  }

  async ensureConnected(): Promise<void> {
    if (this.intentionalDisconnect()) {
      throw new Error('서버 연결이 종료된 상태입니다. 먼저 연결해주세요.')
    }
    if (this.state() === HubConnectionState.Connected) return;
    await this.connect();
    await this.waitUntilConnected();
  }

  async waitUntilConnected(timeoutMs: number = 30_000): Promise<void> {
    const startTime = Date.now();
    const pollInterval = 100;

    while (this.state() !== HubConnectionState.Connected) {
      if (Date.now() - startTime > timeoutMs) {
        throw new Error(`연결 타임아웃 (${timeoutMs}ms 초과)`);
      }
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  // ==================== 유틸리티 ====================
  setIntentionalDisconnect(value: boolean): void {
    this.intentionalDisconnect.set(value);
  }

  isConnected(): boolean {
    return this.state() === HubConnectionState.Connected;
  }

  get hub(): HubConnection {
    return this.connection;
  }

  // ==================== Private 헬퍼 ====================

  private async getAccessToken(): Promise<string> {
    let token = this.tokenStorage.getAccessToken();

    // 토큰이 없으면 바로 빈 문자열 반환
    if (!token) return '';

    if (this.isTokenExpiringSoon(token)) {

      try {
        const result = await firstValueFrom(
          this.tokenService.refreshToken().pipe(
            timeout(5_000),
            catchError(() => {
              return of(null);
            }),
            defaultIfEmpty(null) // EMPTY -> null 변환
          ));

        if (result?.isSuccess && result.content?.token) {
          token = result.content.token;
        } else if (result === null) {
          this.alertService.openSheet([{
            title: '토큰 갱신 불가'
          }])
        } else {
          this.alertService.openSheet([{
            title: '토큰 갱신 문제 발생',
            content: result.message
          }]);
        }
      } catch (err: any) {
        this.alertService.openSheet([{
          title: '토큰갱신실패',
          content: err?.message || err
        }])
      }
    }

    return token || '';
  }

  private isTokenExpiringSoon(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      return exp - now < fiveMinutes;
    } catch {
      return false;
    }
  }

  private isAuthError(error: Error | undefined): boolean {
    return error?.message?.includes('401') ||
      error?.message?.includes('Unauthorized') ||
      false;
  }

  private handleAuthFailure(): void {
    this.logoutService.clearAll();
    this.navigator.to([Paths.SignIn.url]);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
