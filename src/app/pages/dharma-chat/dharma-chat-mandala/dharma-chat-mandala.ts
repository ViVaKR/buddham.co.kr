import { Component, computed, ElementRef, inject, model, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { DharmaChatKarmaService } from '@app/pages/dharma-chat/services/dharma-chat-karma.service';
import { DharmaChatService } from '@app/pages/dharma-chat/services/dharma-chat.service';
import { IDharmaChatView } from '@app/pages/dharma-chat/interfaces/i-dharma-chat';
import { Paths } from '@app/data/menu-data';
import { Clipboard } from '@angular/cdk/clipboard';
import { AlertService } from '@app/core/services/ui/alert.service';
import { ChatConnectionService } from '@app/core/services/chat/chat-connection.service';

@Component({
  selector: 'dharma-chat-mandala',
  imports: [
    CommonModule,
    ...MATERIAL_COMMON,
  ],
  templateUrl: './dharma-chat-mandala.html',
  styleUrl: './dharma-chat-mandala.scss',
})
export default class DharmaChatMandala {

  title = Paths.DharmaChat.ko;
  color = Paths.DharmaChat.color;

  readonly sessionId = 50;
  readonly clipboard = inject(Clipboard);
  readonly aiService = inject(DharmaChatService);
  readonly chatService = inject(ChatConnectionService);
  readonly aiStream = inject(DharmaChatKarmaService);
  readonly alertService = inject(AlertService);

  question = model<string>('');
  scrollArea = viewChild<ElementRef>('scrollArea');
  readonly userScrolled = signal<boolean>(false);
  state = signal<IDharmaChatView | null>(null);

  connected = computed(() => this.aiService.connectionState());

  answer = computed(() => this.state()?.answer() ?? '');
  thinkingAnswer = computed(() => this.state()?.thinkingAnswer() ?? '');
  isThinking = computed(() => this.state()?.isThinking() ?? false);
  isStreaming = computed(() => this.state()?.isStreaming() ?? false);
  currentWisdom = computed(() => this.state()?.currentWisdom() ?? '');
  error = computed(() => this.state()?.error() ?? null);

  // 사용자가 마우스 휠 등으로 스크롤 제어하는지 감지
  onScroll(el: HTMLElement) {
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    this.userScrolled.set(!isAtBottom);
  }

  async onConnect() {

    console.log("Start Connection");

    await this.aiService.connect();
  }

  async onClose() {
    await this.aiService.disconnect();
  }

  async ask(sessionId: number): Promise<void> {

    const q = this.question();
    const newState = this.aiStream.askAiStream(sessionId, q);
    this.state.set(newState);
    const originalUpdate = newState.answer.update;
    newState.answer.update = (fn) => {
      const res = originalUpdate.call(newState.answer, fn);
      this.scrollToBottom();
      return res;
    };
  }

  async newConnect(): Promise<void> {
    console.log("new connect");
    this.chatService.init('https://chat.buddham.co.kr/AiChatHub');
  }

  private scrollToBottom() {
    if (this.userScrolled()) return; // 사용자가 과거 답변 읽는 중이면 스크롤 안 함
    setTimeout(() => {
      const el = this.scrollArea()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.ask(this.sessionId);
    }
  }

  copyAll() {
    const text = this.answer();
    if (text) {
      this.clipboard.copy(text.replace(/<think>[\s\S]*?<\/think>/g, '').trim());
      this.alertService.openSheetAsync([
        {
          title: '클립보드 복사가 완료되었습니다.',
        },
      ]);
    }
  }
  stop(): void {
    this.aiStream.cancel(this.sessionId);
  }
}
