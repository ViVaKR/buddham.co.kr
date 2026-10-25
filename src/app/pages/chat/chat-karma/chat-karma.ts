import { Component, computed, effect, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { ChatKarmaService } from '@app/pages/chat/services/chat-karma.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatAnchor } from '@angular/material/button';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { AuthStore } from '@app/core/services/auth/auth.store';
@Component({
  imports: [
    FormsModule,
    DatePipe,
    MatAnchor,
    ...MATERIAL_COMMON
  ],
  selector: 'chat-karma',
  styleUrl: './chat-karma.scss',
  templateUrl: './chat-karma.html',
})
export default class ChatKarma implements OnInit {

  readonly chat = inject(ChatKarmaService);

  site = 'buddham';
  room = 'lobby';
  draft = '';

  readonly joinedRoom = this.chat.joinedRoom;
  private readonly auth = inject(AuthStore);
  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');

  // 메시지와 입퇴장 이벤트를 시간순으로 합침
  readonly timeline = computed(() => {
    const room = this.joinedRoom();
    const msgs = this.chat.messages().filter(x => x.room === room)
      .map(m => ({ type: 'msg' as const, key: m.id, at: new Date(m.sentAt).getTime(), m }));
    const evts = this.chat.events().filter(x => x.room === room)
      .map(e => ({ type: 'evt' as const, key: `e${e.at.getTime()}${e.user}${e.kind}`, at: e.at.getTime(), e }));
    return [...msgs, ...evts].sort((a, b) => a.at - b.at);
  });

  isMine = (m: { user: string }) => m.user === this.auth.currentUser()?.pseudonym; // 필명 필드명에 맞춰 수정

  constructor() {
    // 새 글이 오면 맨 아래로 스크롤
    effect(() => {
      this.timeline();
      queueMicrotask(() => {
        const el = this.scroller()?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
      });
    });
  }
  async ngOnInit() {
    const saved = await this.chat.restore();
    if (!saved) return;
    this.site = saved.site;
    if (saved.room) this.room = saved.room; // 입력창에도 기억한 방 표시

  }

  connect() { return this.chat.connect(this.site); }
  disconnect() { return this.chat.disconnect(); }
  join() { return this.chat.join(this.room); }
  leave() { return this.chat.leave(); }


  async send() {
    const room = this.joinedRoom();
    const text = this.draft.trim();
    if (!room || !text) return;
    await this.chat.send(room, text);
    this.draft = '';
  }
}
