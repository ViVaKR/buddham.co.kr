import { FixedOrder } from "@app/core/enums/fixed-order";

export interface IQnaUpsertRequest {
  id: number;
  title?: string | null;
  content: string;
  fixedOrder?: FixedOrder | null;
}
