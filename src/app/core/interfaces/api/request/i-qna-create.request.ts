import { FixedOrder } from "@app/core/enums/fixed-order";

export interface IQnaCreateRequest {
  rootId?: number | null;
  parentId?: number | null;
  title?: string | null;
  content: string;
  mentionedUserName?: string | null;
  fixedOrder?: FixedOrder | FixedOrder.NotFixed
}
