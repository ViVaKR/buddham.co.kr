import { IReply } from '@app/core/interfaces/ui/i-reply';
import { DharmaGuideCategory } from '@enums/dharma-guide-category';

export interface IGuideBase {
  dharmaGuideCategory: DharmaGuideCategory;
  title: string;
  content: string;
  rowVersion: number;
}

export interface IGuideView extends IGuideBase {
  id: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  userId: string;
}

export interface IGuidePayload extends IGuideBase {
  id?: number;
}

export interface IGuideComment extends IReply {
  guideId?: number;
  targetId?: number;
}
