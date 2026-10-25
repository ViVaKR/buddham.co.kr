import { FixedOrder } from "@app/core/enums/fixed-order";

export interface IOffsetPagedQuery {

  /** 한 페이지당 레코드 수 */
  pageSize: number;

  /** 현재 페이지 (최소 1 보장) */
  pageNumber: number;

  /** 검색 키워드 */
  searchKeyword?: string | null;

  /** 정렬 기준 (예: createAt, updateAt, title) */
  sortBy?: string | null;

  /** 정렬 옵션 */
  fixedOrder?: FixedOrder;
}

export interface ICursorPagedQuery {

  cursor?: string;
  size: number;
  searchKeyword?: string;
  append?: boolean; // 추가함: 기본값 없으면 cursor 유무로 판단 (1_000개 단우로 끊을때 )
}
