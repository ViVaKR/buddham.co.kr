import { signal } from '@angular/core';

export interface IDharmaChatBase { }

export interface IDharmaChatView extends IDharmaChatBase {
  // 📝 기존 변수들 (기존 모냥 유지)
  answer: ReturnType<typeof signal<string>>; // null 보단 빈 문자열('') 시작이 다닥다닥 붙이기에 좋습니다!
  isStreaming: ReturnType<typeof signal<boolean>>;
  error: ReturnType<typeof signal<string | null>>;

  // 🆕 새로 추가될 티라노 UX용 사유 변수들!
  thinkingAnswer: ReturnType<typeof signal<string>>;
  isThinking: ReturnType<typeof signal<boolean>>;
  currentWisdom: ReturnType<typeof signal<string>>;
}

export interface IDharmaChatPayload extends IDharmaChatBase { }
