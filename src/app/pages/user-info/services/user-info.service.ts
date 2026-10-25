import { Service } from '@angular/core';
import { IUserInfoComment, IUserInfoPayload, IUserInfoUpdateRole, IUserInfoView } from '../interfaces/i-user-info';
import { BaseCursorPagedService } from '@app/core/services/base/base-cursor-paged.service';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { IReactionResponse } from '@app/core/interfaces/ui/i-reaction-response';
import { ReactionType } from '@app/core/enums/reaction-type';
import { IResponse } from '@app/core/interfaces/api/i-response';
import { httpResource } from '@angular/common/http';

@Service()
export class UserInfoService extends BaseCursorPagedService<IUserInfoView, IUserInfoPayload> {

  protected override controller = 'User';

  getListAll = httpResource<IUserInfoView[]>(() => `${this.apiUrl}/User/GetListALL`);

  private baseUrl = environment.api.main;

  private targetType = 'UserInfoComments';

  // * 회원권한 수정
  updateUserRoles(id: string, payload: IUserInfoUpdateRole): Observable<IResponse> {
    // const
    return this.http.put<IResponse>(`${this.baseUrl}/Auth/Users/${id}/Roles`, payload);
  }

  // 댓글 서비스
  // 1. 대댓글 조회
  getReplies = (rootId: number | string): string =>
    `${this.baseUrl}/api/${this.targetType}/comments/Replies/${rootId}`;

  // 2. 원댓글 생성: 기존 주소창 끝에 붙은 불필요한 'Likes/CreateComment' 규칙을 백엔드에 맞춰 담백하게 수정합니다.
  createComment = (root: IUserInfoView, content: string): Observable<IUserInfoComment> =>
    this.http.post<IUserInfoComment>(`${this.baseUrl}/api/${this.targetType}/comments`, {
      targetId: root.id,
      rootId: null,
      parentId: null,
      content: content,
    });

  // 3. 대댓글 생성:
  createReply = (target: IUserInfoComment, content: string): Observable<IUserInfoComment> =>
    this.http.post<IUserInfoComment>(`${this.baseUrl}/api/${this.targetType}/comments`, {
      targetId: target.targetId ?? target.id,
      rootId: target.rootId ?? target.id,
      parentId: target.id,
      content: content,
    });

  deleteComment = (id: number | string): Observable<void> =>
    this.http.delete<void>(`${this.baseUrl}/api/${this.targetType}/comments/${id}`);

  // toggleLike = (id: number | string): Observable<{ isLiked: boolean; likeCount: number }> =>
  //   this.http.post<{ isLiked: boolean; likeCount: number }>(
  //     `${this.baseUrl}/api/${this.targetType}/comments/Likes/${id}`,
  //     {},
  //   );

  toggleReaction = (id: number | string, type: ReactionType): Observable<IReactionResponse> =>
    this.http.post<IReactionResponse>(
      `${this.baseUrl}/api/${this.targetType}/comments/Reactions/${id}`,
      type,
    );

  getAvatar = (comment: IUserInfoComment): string =>
    comment.avatar
      ? `${this.baseUrl}/Avatars/${comment.userId}/${comment.avatar}`
      : `${this.baseUrl}/Avatars/buddha.png`;
}
