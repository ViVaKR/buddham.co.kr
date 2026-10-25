import { inject, Service } from '@angular/core';
import { IChatMessage } from '@app/core/interfaces/chat/i-chat-message';
import { TokenStorage } from '@app/core/services/auth/token.storage';
import { ChatStoreService } from '@app/core/services/chat/chat-store.service';
import { environment } from '@env/environment';
import { v4 as uuidv4 } from 'uuid';

@Service()
export class AiChatStreamService {

  private baseUrl = environment.api.chat;

  private readonly store = inject(ChatStoreService);
  private readonly tokenStorage = inject(TokenStorage);

  public streamAiResponse(roomId: string, roomName: string, prompt: string, userId: string): void {

    const message: IChatMessage = {
      id: uuidv4(),
      roomId,
      userId,
      userName: '도반',
      avatar: 'default.png',
      content: prompt,
      sentAt: new Date()
    }
    // 1. 사용자 질문을 Store 에 기록
    this.store.addMessage(roomId, message);

    // 2. AI 답변 플레이스홀더 메시지 생성
    const aiMessageId = uuidv4();
    this.store.addMessage(roomId, {
      id: aiMessageId,
      roomId,
      userId: 'buddham-ai',
      userName: '법등 스님',
      avatar: 'default.png',
      content: '',
      sentAt: new Date()
    });

    // 3. fetch 기반 EventSource (Header에 Bearer 토큰 탑재 가능)
    const url = `${this.baseUrl}/Ai/ask-stream?prompt=${encodeURIComponent(prompt)}&userId=${encodeURIComponent(userId)}`;
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.tokenStorage.getAccessToken()}`
      }
    }).then(async response => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      if (!reader) return;

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (!dataStr) continue;

            try {
              const parsed = JSON.parse(dataStr); // { Type: "token", Data: "도", ErrorCode: "" }
              if (parsed.Type === 'token' && parsed.Data) {
                // 실시간 토큰을 Signals Store에 반영!
                // this.store.updateLastMessageContent(roomId, parsed.Data);
              }
            } catch (e) {
              console.error('SSE JSON 파싱 오류:', e);
            }
          }
        }
      }
    });




  }
}
