import { inject, Service, signal } from '@angular/core';
import { TokenStorage } from '@app/core/services/auth/token.storage';
import { BaseService } from '@app/core/services/base/base.service';
import { ChatConnectionService } from '@app/core/services/chat/chat-connection.service';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { HttpTransportType } from '@microsoft/signalr';

@Service()
export class DharmaChatService extends BaseService {

  private hubConnection: HubConnection | null = null;
  readonly connectionState = signal<HubConnectionState>(HubConnectionState.Disconnected);
  readonly tokenStorage = inject(TokenStorage);
  readonly chatConnectionService = inject(ChatConnectionService);

  async connect(): Promise<void> {

    console.log(this.hubConnection?.state);
    if (this.hubConnection?.state === HubConnectionState.Connected) return;

    const accessToken = this.tokenStorage.getAccessToken();
    if (accessToken === null) return;

    this.hubConnection = new HubConnectionBuilder().withUrl(`${this.chatUrl}/ChatHub`, {
      accessTokenFactory: () => accessToken,
      transport: HttpTransportType.ServerSentEvents | HttpTransportType.LongPolling
    }).withAutomaticReconnect([0, 2_000, 10_000, 30_000])
      .configureLogging(LogLevel.Information)
      .build();

    this.hubConnection.onreconnecting(() => this.connectionState.set(HubConnectionState.Reconnecting));
    this.hubConnection.onreconnected(() => this.connectionState.set(HubConnectionState.Connected));
    this.hubConnection.onclose(() => this.connectionState.set(HubConnectionState.Disconnected));
    await this.hubConnection.start();
    this.connectionState.set(HubConnectionState.Connected);
  }

  getConnection(): HubConnection {
    if (!this.hubConnection)
      throw new Error('허브 연결이 아직 시작되지 않았어요. connect() 먼저 호출하세요.');
    return this.hubConnection;
  }

  async disconnect(): Promise<void> {
    await this.hubConnection?.stop();
    this.hubConnection = null;
  }
}
