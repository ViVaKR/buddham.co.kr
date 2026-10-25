import { IResponseBase } from '@app/core/interfaces/base/response-base';

// ====================================================
// -->  Result - 데이터 없는 응답
// ====================================================
export interface IResponse extends IResponseBase { }

// ====================================================
// --> Response<T> (Result<T>) - 데이터 있는 응답 전용
// ====================================================
export interface IDataResponse<T> extends IResponseBase {
  content?: T;
}

// ====================================================
// --> PagedResponse<T> (PagedResult<T>) - 오프셋 페이징
// ====================================================
export interface IOffsetResponse<T> extends IDataResponse<T[]> {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ====================================================
// --> CursorPagedResponse<T> (CursorPagedResult<T>)
// ====================================================
export interface ICursorResponse<T> extends IDataResponse<T[]> {
  nextCursor?: string;
  hasMore: boolean;
  totalCount: number;
}

export interface IChatResponse<T> {

  /** 데이터 배열 */
  items: T[];

  /** 전체 데이터 개수 */
  totalCount: number;

  /** 현재 페이지 번호 */
  pageNumber: number;

  /** 페이지 크기 */
  pageSize: number;

  /** 전체 페이지 수 */
  totalPages: number;

  /** 이전 페이지 존재 여부 */
  hasPreviousPage: boolean;

  /** 다음 페이지 존재 여부 */
  hasNextPage: boolean;
}
