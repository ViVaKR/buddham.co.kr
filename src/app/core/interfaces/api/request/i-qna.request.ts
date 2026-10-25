import { IQnaModel } from "@app/core/interfaces/api/models/i-qna.model";

export interface IQnaRequest extends IQnaModel {
  parentId?: number | null;
  replyCount: number;
  isLikedByMe: boolean;
}
