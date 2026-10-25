import { CommonModule } from '@angular/common';
import { httpResource } from '@angular/common/http';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IThreadable } from '@app/core/interceptors/IThreadable';
import { IQnaRequest } from '@app/core/interfaces/api/request/i-qna.request';
import { AvatarUrlPipe } from '@app/core/pipes/avatar-url-pipe';
import { TruncatePipe } from '@app/core/pipes/truncate-pipe';
import { UserStore } from '@app/core/services/auth/user.store';
import { QnaService } from '@app/core/services/qna/qna-service';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { environment } from '@env/environment';

@Component({
  selector: 'thread-board',
  imports: [CommonModule, ...MATERIAL_COMMON, TruncatePipe, AvatarUrlPipe],
  templateUrl: './thread-board.html',
  styleUrl: './thread-board.scss',
})
export class ThreadBoard<T extends IThreadable> {
  private baseUrl = environment.api.main;
  readonly service = inject(QnaService);
  private destroyRef = inject(DestroyRef);
  readonly userStore = inject(UserStore);

  rootItem = input.required<T>();
  parentTitle = input<string>();

  readonly user = this.userStore.user();

  // 답글 작성 대상
  readonly replyTarget = signal<IQnaRequest | null>(null);
  readonly replyContent = signal<string>('');
  readonly commentFocused = signal<boolean>(false);

  // 🔥 댓글(1단계) 입력용 - rootItem 대상
  readonly commentContent = signal<string>('');

  // 좋아요 (처리중 중복 방지)
  readonly likingIds = signal<Set<number>>(new Set());
  readonly localReplies = signal<IQnaRequest[]>([]);
  readonly replyCount = computed(() => {
    const root = this.rootItem() as any;
    return root?.replyCount ?? this.localReplies().length;
  });

  readonly sortedReplies = computed(() => {
    const flat = this.localReplies();
    if (!flat.length) return [];

    const result: IQnaRequest[] = [];

    // 재귀로 자식들을 찾아서 바로 아래에 삽입
    const appendChildren = (parentId: number) => {
      const children = flat.filter((x) => x.parentId === parentId);
      for (const child of children) {
        result.push(child);
        appendChildren(child.id); // 🔥 재귀 - 대대댓글도 처리
      }
    };

    // 1단계 루트 댓글들
    const roots = flat.filter((x) => !x.parentId);
    for (const root of roots) {
      result.push(root);
      appendChildren(root.id);
    }

    return result;
  });

  // 🔥 input 시그널을 직접 팩토리에서 읽음 → 타이밍 문제 원천 차단
  readonly repliesResource = httpResource<IQnaRequest[]>(() => {
    const item = this.rootItem();
    if (!item?.id) return undefined;
    return `${this.baseUrl}/Buddham/Replies/${item.id}`;
  });

  // replies 는 localReplies 로 교체
  // readonly replies = this.repliesResource.value;
  readonly replies = this.localReplies;
  readonly isLoading = this.repliesResource.isLoading;
  readonly defaultAvatar = `${this.baseUrl}/Images/avatars/buddha.png`;

  constructor() {
    effect(() => {
      const data = this.repliesResource.value();
      if (data) this.localReplies.set(data);
    });
  }

  getUserAvatar(reply?: IQnaRequest) {
    const userId = reply?.userId;
    const avatar = reply?.avatar;
    if (avatar == null) return this.defaultAvatar;
    return `${this.baseUrl}/Images/avatars/${userId}/${avatar}`;
  }

  onErrorImg() {
    return;
  }

  onLikeClick(item: IQnaRequest): void {
    const id = item.id as number;

    // 🔥 중복 클릭 방지
    if (this.likingIds().has(id)) return;
    this.likingIds.update((set) => new Set(set).add(id));

    // 🔥 낙관적 업데이트 (즉시 UI 반영)
    const currentReplies = this.repliesResource.value() ?? [];
    const optimistic = currentReplies.map((x) =>
      x.id === id
        ? {
          ...x,
          isLikedByMe: !x.isLikedByMe,
          likeCount: x.isLikedByMe ? x.likeCount - 1 : x.likeCount + 1,
        }
        : x,
    );

    // signal 직접 조작 대신 로컬 override signal 사용
    this.localReplies.set(optimistic);

    this.service.toggleLike(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        // 🔥 서버 응답으로 정확히 동기화
        next: (res) => {
          this.localReplies.update((replies) =>
            replies.map((x) =>
              x.id === id ? { ...x, isLikedByMe: res.isLiked, likeCount: res.likeCount } : x,
            ),
          );
          this.likingIds.update((set) => {
            const next = new Set(set);
            next.delete(id);
            return next;
          });
        },
        error: () => {
          // 🔥 실패 시 롤백
          this.localReplies.set(currentReplies);
          this.likingIds.update((set) => {
            const next = new Set(set);
            next.delete(id);
            return next;
          });
        },
      });
  }

  onReplyClick(item: IQnaRequest): void {
    this.replyTarget.set(this.replyTarget()?.id === item.id ? null : item);
    this.replyContent.set('');
  }

  submitReply(): void {
    const target = this.replyTarget();
    const replyConent = this.replyContent().trim();

    if (!target || !replyConent) return;

    this.service
      .createReply(target, replyConent)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.replyTarget.set(null);
          this.replyContent.set('');
          this.repliesResource.reload(); // 🔥 로컬 resource reload
        },
        error: (err) => console.error('답글 등록 실패:', err),
      });
  }

  submitComment(): void {
    const root = this.rootItem() as unknown as IQnaRequest;
    const content = this.commentContent().trim();
    if (!content) return;

    // createReply -. createComment 로 변경
    // this.service.createReply(root, content)
    this.service
      .createComment(root, content)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.commentContent.set('');
          this.commentFocused.set(false);
          this.repliesResource.reload(); // 댓글 등록 후 갱신
        },
        error: (err) => console.error('댓글 등록 실패:', err),
      });
  }
}
