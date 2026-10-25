import { FixedOrder } from "@app/core/enums/fixed-order";

export interface IQnaModel {
  id: number;
  rootId: number | null;
  mentionedUserName: string | null;
  title: string | null;
  content: string;
  createdAt: Date;
  modifiedAt: Date | null;
  userId: string;
  pseudonym: string;
  avatar?: string;
  likeCount: number;
  fixedOrder?: FixedOrder | null;

}
