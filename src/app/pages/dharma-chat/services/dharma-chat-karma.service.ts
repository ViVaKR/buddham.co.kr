import { inject, Service, signal } from '@angular/core';
import { DharmaChatService } from './dharma-chat.service';
import { IDharmaChatView } from '@app/pages/dharma-chat/interfaces/i-dharma-chat';
import { BaseService } from '@app/core/services/base/base.service';

@Service()
export class DharmaChatKarmaService extends BaseService {

  private readonly sessions = new Map<number, IDharmaChatView>();
  private readonly hubService = inject(DharmaChatService);

  // 🌸 티라노 시절의 아름다운 명언 리스트
  private readonly wisdoms = [
    '강물은 흐르기를 멈추지 않으나, 그 속의 달은 항상 고요합니다.',
    '마음이 일어나면 모든 것이 일어나고, 마음이 사라지면 모든 것이 사라집니다.',
    '한 송이 꽃이 피어남에 온 우주가 함께합니다.',
    '비우면 비울수록 채워지는 것이 지혜의 이치입니다.',
  ];

  /**
   * sessionId 기준으로 AI 질의 스트림을 시작하고, 반응형 상태(state)를 돌려준다.
   * 이미 같은 세션에서 스트리밍 중이면 중복 호출을 막는다.
   */
  askAiStream(sessionId: number, question: string): IDharmaChatView {

    const exiting = this.sessions.get(sessionId);
    if (exiting?.isStreaming()) {

      return exiting;
    }

    const randomWisdom = this.wisdoms[Math.floor(Math.random() * this.wisdoms.length)];

    if (exiting) {
      exiting.answer.set('');
      exiting.thinkingAnswer.set('');
      exiting.isThinking.set(true); // 처음엔 생각부터 시작!
      exiting.isStreaming.set(true);
      exiting.currentWisdom.set(randomWisdom);
      exiting.error.set(null);
    }

    const state: IDharmaChatView = exiting ?? {
      answer: signal(''),
      thinkingAnswer: signal(''),
      isThinking: signal(true),
      isStreaming: signal(true),
      currentWisdom: signal(randomWisdom),
      error: signal<string | null>(null)
    };

    this.sessions.set(sessionId, state);

    const connection = this.hubService.getConnection();

    // 💡 백엔드 ChatHub의 public async IAsyncEnumerable<string> AskAiStream 스펙에 맞춤
    // 만약 허브에서 'thinking' 문자열 구분 규칙을 준다면 여기서 분기하고,
    // 현재는 일반 토큰 스트림이므로 들어오는 대로 답변을 채우되 첫 토큰이 오면 생각 상태를 끕니다.
    this.loading.set(true);
    const streamResult = connection.stream<string>('AskAiStream', sessionId, question);

    const subscription = streamResult.subscribe({
      next: (token) => {
        // 토큰이 들어오기 시작하면 AI가 생각을 끝내고 답변을 하고 있다는 뜻!
        if (state.isThinking()) {
          state.isThinking.set(false);
        }
        state.answer.update((prev) => prev + token)
      },
      error: (err) => {
        console.error('AI 스트림 에러:', err);
        state.error.set(this.extractErrorMessage(err));
        state.isStreaming.set(false);
        this.loading.set(false);
      }, complete: () => {
        state.isStreaming.set(false);
        this.loading.set(false);
      }
    });

    // 취소 핸들 보관 (컴포넌트에서 cancel 호출할 수 있게)
    (state as any).__subscription = subscription;

    return state;
  }
  /** 사용자가 답변 도중 취소(중단) 버튼을 눌렀을 때 */
  cancel(sessionId: number): void {
    const state = this.sessions.get(sessionId);
    const subscription = (state as any)?.__subscription;
    if (subscription)
      subscription.unsubscribe();

    state?.isStreaming.set(false);
    state?.isThinking.set(false);
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return '알 수 없는 오류가 발생했습니다.';
  }
}
