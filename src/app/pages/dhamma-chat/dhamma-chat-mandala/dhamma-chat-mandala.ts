import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { DhammaChatService } from '@app/pages/dhamma-chat/services/dhamma-chat.service';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { Subscription } from 'rxjs';
interface Msg {
  role: 'user' | 'assistant';
  text: string;
  error?: boolean;
}

@Component({
  imports: [
    ...MATERIAL_COMMON
  ],
  selector: 'dhamma-chat-mandala',
  styleUrl: './dhamma-chat-mandala.scss',
  templateUrl: './dhamma-chat-mandala.html',
})
export default class DhammaChatMandala {
  private readonly chat = inject(DhammaChatService);
  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');

  readonly messages = signal<Msg[]>([]);
  readonly draft = signal('');
  readonly streaming = signal(false);

  private sub?: Subscription;

  onKeydown(e: KeyboardEvent) {
    // 한글 IME 조합 중 Enter 는 무시 (안 하면 마지막 글자가 중복 전송됨)
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      this.send();
    }
  }

  send() {
    const q = this.draft().trim();
    if (!q || this.streaming()) return;

    this.draft.set('');
    this.messages.update((l) => [
      ...l,
      { role: 'user', text: q },
      { role: 'assistant', text: '' },
    ]);
    this.streaming.set(true);
    this.scrollToBottom();

    this.sub = this.chat.ask(q).subscribe({
      next: (token) => {
        this.patchLast((m) => ({ ...m, text: m.text + token }));
        this.scrollToBottom();
      },
      error: (err) => {
        console.error(err);
        this.patchLast((m) => ({
          ...m,
          error: true,
          text: m.text || '답변을 받아오지 못했습니다. 잠시 후 다시 시도해 주세요.',
        }));
        this.streaming.set(false);
      },
      complete: () => this.streaming.set(false),
    });
  }

  stop() {
    this.sub?.unsubscribe();
    this.streaming.set(false);
  }

  private patchLast(fn: (m: Msg) => Msg) {
    this.messages.update((l) => [...l.slice(0, -1), fn(l[l.length - 1])]);
  }

  private scrollToBottom() {
    queueMicrotask(() => {
      const el = this.scroller()?.nativeElement;
      el?.scrollTo({ top: el.scrollHeight });
    });
  }
}
