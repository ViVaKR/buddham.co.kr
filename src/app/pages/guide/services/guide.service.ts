import { Service } from '@angular/core';
import { BaseCursorPagedService } from '@app/core/services/base/base-cursor-paged.service';
import {
  IGuideComment,
  IGuidePayload,
  IGuideView,
} from '@app/core/interfaces/api/request/i-guide.request';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { IReactionResponse } from '@interfaces/ui/i-reaction-response';
import { ReactionType } from '@enums/reaction-type';

@Service()
export class GuideService extends BaseCursorPagedService<IGuideView, IGuidePayload> {
  protected override controller = 'Guide';
  private baseUrl = environment.api.main;

  // 서버 [Route("GuideComment")] 와 동일해야 함
  private readonly commentUrl = `${this.baseUrl}/GuideComment`;

  // ── 댓글 ───────────────────────────────────────────

  // 1. 댓글 목록 조회 (URL 만 반환) : GET GuideComments/Replies/{guideId}
  getReplies = (guideId: number | string): string => `${this.commentUrl}/Replies/${guideId}`;

  // 2. 원댓글 생성 : POST GuideComments/CommentCreate
  createComment = (root: IGuideView, content: string): Observable<IGuideComment> =>
    this.http.post<IGuideComment>(`${this.commentUrl}/CommentCreate`, {
      targetId: root.id,
      rootId: null,
      parentId: null,
      content,
    });

  // 3. 대댓글 생성 : POST GuideComments/CommentCreate
  //    targetId / mentionedUserName 은 서버가 부모 댓글에서 상속하므로 보내지 않는다.
  createReply = (target: IGuideComment, content: string): Observable<IGuideComment> =>
    this.http.post<IGuideComment>(`${this.commentUrl}/CommentCreate`, {
      rootId: target.rootId ?? target.id,
      parentId: target.id,
      content,
    });

  // 4. 삭제 : DELETE GuideComments/CommentDelete/{id}
  deleteComment = (id: number | string): Observable<void> =>
    this.http.delete<void>(`${this.commentUrl}/CommentDelete/${id}`);

  // 5. 리액션 : POST GuideComments/Reactions/{id}?reactionType=...
  toggleReaction = (id: number | string, type: ReactionType): Observable<IReactionResponse> =>
    this.http.post<IReactionResponse>(`${this.commentUrl}/Reactions/${id}`, null, {
      params: { reactionType: type },
    });

  getAvatar = (comment: IGuideComment): string =>
    comment.avatar
      ? `${this.baseUrl}/Avatars/${comment.userId}/${comment.avatar}`
      : `${this.baseUrl}/Avatars/buddha.png`;
}
