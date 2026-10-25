import { CommonModule, NgOptimizedImage } from '@angular/common';
import { httpResource } from '@angular/common/http';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IThreadable } from '@app/core/interceptors/IThreadable';
import { ILikeResponse } from '@app/core/interfaces/ui/i-like-response';
import { IReply } from '@app/core/interfaces/ui/i-reply';
import { AvatarUrlPipe } from '@app/core/pipes/avatar-url-pipe';
import { TruncatePipe } from '@app/core/pipes/truncate-pipe';
import { UserStore } from '@app/core/services/auth/user.store';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { ReactionType } from '@enums/reaction-type';
import { IReactionResponse } from '@interfaces/ui/i-reaction-response';

@Component({
  selector: 'reply-board',
  imports: [CommonModule, ...MATERIAL_COMMON, TruncatePipe, AvatarUrlPipe, NgOptimizedImage],
  templateUrl: './reply-board.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './reply-board.scss',
})
export class ReplyBoard<T extends IThreadable, U extends IReply, R extends ILikeResponse> {
  private baseUrl = environment.api.main;
  private destroyRef = inject(DestroyRef);
  readonly userStore = inject(UserStore);

  // ✅ Input 시그널 제너릭 적용
  rootItem = input.required<T>();
  parentTitle = input<string>();

  user = this.userStore.user();

  // ✅ 외부에서 주입받는 함수들 (서비스 의존성 제거)
  fetchRepliesFn = input.required<(rootId: number | string) => string>();
  createCommentFn = input.required<(root: T, content: string) => Observable<U>>();
  createReplyFn = input.required<(target: U, content: string) => Observable<U>>();
  toggleReactionFn =
    input.required<(id: number | string, type: ReactionType) => Observable<IReactionResponse>>();

  getAvatarUrlFn = input<(reply: U) => string>();

  canDeleteFn = input<(item: U) => boolean>();
  deleteCommentFn = input<(id: number | string) => Observable<void>>();

  readonly reactingIds = signal<Set<number | string>>(new Set());
  // ✅ 답글 작성 대상 - U 제너릭
  readonly replyTarget = signal<U | null>(null);
  readonly replyContent = signal<string>('');
  readonly commentFocused = signal<boolean>(false);
  readonly commentContent = signal<string>('');

  // ✅ 좋아요 처리 - id 타입도 제너릭
  readonly likingIds = signal<Set<number | string>>(new Set());
  readonly localReplies = signal<U[]>([]);

  readonly replyCount = computed(() => {
    const root = this.rootItem() as any;
    return root?.replyCount ?? this.localReplies().length;
  });

  readonly sortedReplies = computed(() => {
    const flat = this.localReplies();
    if (!flat.length) return [];

    const result: U[] = [];

    const appendChildren = (parentId: number | string) => {
      const children = flat.filter((x) => x.parentId === parentId);
      for (const child of children) {
        result.push(child);
        appendChildren(child.id);
      }
    };

    const roots = flat.filter((x) => !x.parentId);
    for (const root of roots) {
      result.push(root);
      appendChildren(root.id);
    }

    return result;
  });

  // ✅ httpResource - fetchRepliesFn 을 통해 URL 생성
  readonly repliesResource = httpResource<U[]>(() => {
    const item = this.rootItem();
    const fn = this.fetchRepliesFn();
    if (!item?.id || !fn) return undefined;
    return fn(item.id);
  });

  // readonly replies = this.localReplies;
  readonly isLoading = this.repliesResource.isLoading;
  readonly defaultAvatar = computed(() => this.userStore.defaultAvatar);

  constructor() {
    effect(() => {
      const data = this.repliesResource.value();
      if (data) this.localReplies.set(data);
    });
  }

  onReactionClick(item: U, type: ReactionType): void {

    const id = item.id;
    if (this.reactingIds().has(id)) return;
    this.reactingIds.update((s) => new Set(s).add(id));

    // 낙관적 업데이트
    const currentReplies = this.localReplies();
    const isSame = item.currentReaction === type;

    // 낙관적 업데이트도 정리
    this.localReplies.update((r) =>
      r.map((x) =>
        x.id === id
          ? {
            ...x,
            currentReaction: isSame ? ReactionType.None : type,
            hapjangCount:
              x.hapjangCount + (type === ReactionType.Hapjang ? (isSame ? -1 : 1) : 0),
            lotusCount: x.lotusCount + (type === ReactionType.Lotus ? (isSame ? -1 : 1) : 0),
            meritCount: x.meritCount + (type === ReactionType.Merit ? (isSame ? -1 : 1) : 0),
          }
          : x,
      ),
    );

    this.toggleReactionFn()(id, type)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.localReplies.update((r) =>
            r.map((x) =>
              x.id === id
                ? {
                  ...x,
                  ...res,
                }
                : x,
            ),
          );
          this.reactingIds.update((s) => {
            const n = new Set(s);
            n.delete(id);
            return n;
          });
        },
        error: () => {
          this.localReplies.set(currentReplies);
          this.reactingIds.update((s) => {
            const n = new Set(s);
            n.delete(id);
            return n;
          });
        },
      });
  }

  deleteComment(item: U): void {
    if (!confirm('댓글을 삭제할까요?')) return;

    this.deleteCommentFn()!(item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (!item.parentId) {
            // 루트댓글 → 자식 대댓글도 로컬에서 제거
            this.localReplies.update((r) =>
              r.filter((x) => x.id !== item.id && x.rootId !== item.id),
            );
          } else {
            this.localReplies.update((r) => r.filter((x) => x.id !== item.id));
          }
        },
        error: (err) => console.error('삭제 실패:', err),
      });
  }

  // ✅ 아바타 - 외부 fn 우선, 없으면 기본 동작
  getUserAvatar(reply?: U): string {
    const customFn = this.getAvatarUrlFn();
    if (customFn && reply) return customFn(reply);

    const userId = reply?.userId;
    const avatar = reply?.avatar;
    if (avatar == null) return this.defaultAvatar();
    return `${this.baseUrl}/Avatars/${userId}/${avatar}`;
  }

  onReplyClick(item: U): void {
    this.replyTarget.set(this.replyTarget()?.id === item.id ? null : item);
    this.replyContent.set('');
  }

  submitReply(): void {
    const target = this.replyTarget();
    const content = this.replyContent().trim();
    if (!target || !content) return;

    this.createReplyFn()(target, content)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.replyTarget.set(null);
          this.replyContent.set('');
          this.repliesResource.reload();
        },
        error: (err) => console.error('답글 등록 실패:', err),
      });
  }

  submitComment(): void {
    const root = this.rootItem();
    const content = this.commentContent().trim();
    if (!content) return;

    this.createCommentFn()(root, content)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.commentContent.set('');
          this.commentFocused.set(false);
          this.repliesResource.reload();
        },
        error: (err) => console.error('댓글 등록 실패:', err),
      });
  }
}
