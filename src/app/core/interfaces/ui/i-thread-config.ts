import { IThreadable } from "@app/core/interceptors/IThreadable";
import { ILikeResponse } from "@app/core/interfaces/ui/i-like-response";
import { IReply } from "@app/core/interfaces/ui/i-reply";
import { Observable } from "rxjs";
import { ReactionType } from '@enums/reaction-type';
import { IReactionResponse } from '@interfaces/ui/i-reaction-response';

/**
 * 쓰레드 보드 전략 컴포넌트를 구성하기 위한 추상 인터페이스
 * 타입역할예시
 * T 최상위 아이템 - IDharmaScriptureView 등
 * U 댓글/대댓글 - IScriptureComment
 * R 좋아요 응답 - ILikeResponse (생략 가능)
 * 🔥 T = rootItem, U = 댓글, R = 좋아요 응답
 */
export interface IThreadConfig<
  T extends IThreadable,                   // rootItem 타입 (IDharmaScriptureView 등)
  U extends IReply,                        // 댓글 타입 (IScriptureComment 등)
  R extends ILikeResponse = ILikeResponse  // 기본값으로 생략 가능
> {
  fetchRepliesUrl: (rootId: number | string) => string;
  createCommentFn: (root: T, content: string) => Observable<U>; // 🔥 any → T
  createReplyFn: (target: U, content: string) => Observable<U>;
  canDeleteFn: (item: U) => boolean;
  deleteReplyFn: (id: number | string) => Observable<void>;
  getAvatarUrlFn?: (reply: U) => string;
  toggleReactionFn: (id: number | string, type: ReactionType) => Observable<IReactionResponse>;
}
