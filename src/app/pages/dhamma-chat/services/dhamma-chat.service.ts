import { Service } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { IDhammaChatPayload, IDhammaChatView } from '../interfaces/i-dhamma-chat';
import { IResponse } from '@app/core/interfaces/api/i-response';
import { BaseService } from '@app/core/services/base/base.service';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';

// Dhamma.Chat 의 launchSettings 주소에 맞추세요 (curl 테스트하신 포트)
const HUB_URL = 'http://localhost:5186/chathub';

@Service()
export class DhammaChatService extends BaseService {

  private readonly conn: HubConnection = new HubConnectionBuilder()
    .withUrl(HUB_URL)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();

  private starting?: Promise<void>;

  private ensureStarted(): Promise<void> {
    if (this.conn.state === HubConnectionState.Connected) return Promise.resolve();
    // 동시에 여러 번 start() 호출되는 것 방지
    this.starting ??= this.conn.start().finally(() => (this.starting = undefined));
    return this.starting;
  }

  /** 토큰 단위로 방출. unsubscribe() 하면 서버까지 취소가 전파됩니다. */
  ask(question: string): Observable<string> {
    return new Observable<string>((sub) => {
      let disposed = false;
      let streamSub: { dispose(): void } | undefined;

      this.ensureStarted()
        .then(() => {
          if (disposed) return;
          streamSub = this.conn.stream<string>('Ask', question).subscribe({
            next: (token) => sub.next(token),
            error: (err) => sub.error(err),
            complete: () => sub.complete(),
          });
        })
        .catch((err) => sub.error(err));

      return () => {
        disposed = true;
        streamSub?.dispose(); // -> Hub 의 CancellationToken -> gRPC -> Ollama 까지 취소
      };
    });
  }
}
