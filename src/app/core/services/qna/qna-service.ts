import { HttpParams } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FixedOrder } from '@app/core/enums/fixed-order';
import { IOffsetPagedQuery } from '@app/core/interfaces/api/i-query';
import { IOffsetResponse, IResponse } from '@app/core/interfaces/api/i-response';
import { IQnaCreateRequest } from '@app/core/interfaces/api/request/i-qna-create.request';
import { IQnaUpsertRequest } from '@app/core/interfaces/api/request/i-qna-upsert.request';
import { IQnaRequest } from '@app/core/interfaces/api/request/i-qna.request';
import { ISearchConfig } from '@app/core/interfaces/ui/i-search-config';
import { BaseService } from '@app/core/services/base/base.service';
import { debounceTime, distinctUntilChanged, finalize, firstValueFrom, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QnaService extends BaseService {

  /**
   * 검색전략
   * 외부에서 주입가능
   */
  readonly searchConfig: ISearchConfig = {
    strategy: 'server',
    localThreshold: 1, // 로컬 : 1
    serverThreshold: 2 // 서버 : 2
  }

  // ── 초기 쿼리 ──────────────────────────────
  private readonly initialQuery: IOffsetPagedQuery = {
    pageNumber: 1,
    pageSize: 100,
    searchKeyword: '',
    sortBy: '',
    fixedOrder: FixedOrder.NotFixed

  }

  // ── State Signals ───────────────────────────
  readonly isLoading = signal(false);
  readonly error = signal<any>(null);
  readonly query = signal<IOffsetPagedQuery>({ ...this.initialQuery });
  public activeRootId = signal<number | string | null>(null);
  readonly state = signal<{
    content: IQnaRequest[];
    totalCount: number;
    currentPage: number;
    hasNextPage: boolean;
  }>({ content: [], totalCount: 0, currentPage: 0, hasNextPage: false });

  // ── Computed ────────────────────────────────
  readonly dataList = computed(() => this.state().content);
  readonly totalCount = computed(() => this.state().totalCount);
  readonly hasNext = computed(() => this.state().hasNextPage);
  readonly isSearchMode = computed(() => (this.query().searchKeyword ?? '').trim().length > 0);

  readonly accumulatedData = computed(() => this.state().content);
  readonly currentPage = computed(() => this.state().currentPage);

  // 서버 검색 활성 여부
  readonly isServerSearchActive = computed(() =>
    (this.query().searchKeyword ?? '').trim().length >= this.searchConfig.serverThreshold
    && this.searchConfig.strategy === 'server'
  );

  // 검색 모드 여부 (더보기 버튼 숨김/표시 제어용)
  // ── 검색 디바운스 ────────────────────────────
  private readonly searchKeyword = signal<string>('');

  constructor() {
    super();
    // 1. 시그널을 Observable 로 변환 (Angular 가 생명 주기 자동관리)
    toObservable(this.searchKeyword).pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(keyword => {
      this.resetAndReload(keyword);
    });

  }

  /**
   * 목록 불러오기
   * append : 더보기 여부
   * @param query
   * @param append
   */
  public loadDataList(query: IOffsetPagedQuery, append: boolean = false): void {

    this.isLoading.set(true);
    this.error.set(null);

    let params = new HttpParams()
      .append('pageNumber', query.pageNumber)
      .append('pageSize', query.pageSize)
      .append('fixedOrder', query.fixedOrder ?? FixedOrder.NotFixed);

    if (query.searchKeyword) {
      params = params.append('searchKeyword', query.searchKeyword);
    }

    this.http.get<IOffsetResponse<IQnaRequest>>(`${this.apiUrl}/Buddham/QnaList`, { params })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: res => {
          if (append) {
            this.state.update(prev => ({
              content: [...prev.content, ...(res.content ?? [])],
              totalCount: res.totalCount,
              currentPage: res.pageSize,
              hasNextPage: res.hasNext ?? false
            }));
          } else {
            this.state.set({
              content: res.content ?? [],
              totalCount: res.totalCount,
              currentPage: res.page,
              hasNextPage: res.hasNext ?? false
            });
          }
        },
        error: err => this.error.set(err)
      });
  }

  /**
   * 단건 조회
   * @param id
   * @returns
   */
  getQnaById(id: number): Observable<IResponse> {
    return this.http.get<IResponse>(`${this.apiUrl}/Buddham/QnaRead/${id}`);
  }

  /**
   * 질문과 답변 생성 및 수정하기
   */
  public async qnaCreateOrUpdate(payload: IQnaUpsertRequest, id?: number): Promise<IResponse> {
    const res = id
      ? await firstValueFrom(this.http.put<IResponse>(
        `${this.apiUrl}/Buddham/QnaUpdate/${id}`, { ...payload, id }))
      : await firstValueFrom(this.http.post<IResponse>(`${this.apiUrl}/Buddham/QnaCreateRoot`, payload));

    if (res.isSuccess) this.reload();
    return res;
  }

  /**
   * 삭제
   */
  public async deleteQna(id: number): Promise<IResponse> {
    const res = await firstValueFrom(
      this.http.delete<IResponse>(`${this.apiUrl}/Buddham/QnaDelete/${id}`));
    if (res.isSuccess) this.reload();
    return res;
  }

  /**
   * 1단계 댓글
   * parentId 없음
   * mentionedUserName 없음
   */
  createComment(rootItem: IQnaRequest, content: string): Observable<IResponse> {
    const dto: IQnaCreateRequest = {
      parentId: null,
      rootId: rootItem.id as number,
      title: rootItem.title,
      content
    }
    return this.http.post<IResponse>(`${this.apiUrl}/Buddham/QnaCreate`, dto);
  }

  /**
   * 2단계 대댓글
   * parentId 있음
   * 서버에서 mentionedUserName 자동설정
   */
  createReply(payload: IQnaRequest, replyContent: string): Observable<IResponse> {

    // 1. 최상위 루트 ID를 찾음 (대대대댓글이라도 끝까지 추적)
    const finalRootId = Number(payload.rootId);

    // 2. 현재 활성화된 리소스 ID 를 강제로 맞춤 (새로 고침 타켓팅)
    this.activeRootId.set(finalRootId);

    // 3. 서버 DTO 구성
    const dto: IQnaCreateRequest = {
      parentId: Number(payload.id),      // 내가 누구한테 답장하는가?
      rootId: finalRootId,             // 이 대화의 뿌리는 어디인가?
      title: `Re: ${payload.title || 'Re: Reply'}`,
      content: replyContent, // 사용자가 입력한 새 내용
      mentionedUserName: payload.pseudonym,
      fixedOrder: FixedOrder.NotFixed
    };

    return this.http.post<IResponse>(`${this.apiUrl}/Buddham/QnaCreate`, dto);
  }

  /**
   * 더보기
   */
  loadNextPage(): void {

    if (!this.state().hasNextPage) return;
    const nextQuery = { ...this.query(), pageNumber: this.query().pageNumber + 1 };
    this.query.set(nextQuery);
    this.loadDataList(nextQuery, true);
  }

  /**
   * 좋아요 토글
   */
  toggleLike(id: number): Observable<{ likeCount: number; isLiked: boolean }> {
    return this.http.post<{ likeCount: number; isLiked: boolean }>(
      `${this.apiUrl}/Buddham/QnaLikes/${id}/like`, {}
    );
  }

  /** 검색 (디바운스) */
  searchByKeyword(keyword: string): void {
    this.searchKeyword.set(keyword.trim());
  }

  /** 초기화 후 재조회 */
  resetAndReload(keyword?: string): void {
    const newQuery = { ...this.initialQuery, searchKeyword: keyword ?? '' };
    this.query.set(newQuery);
    this.loadDataList(newQuery, false);
  }

  changePage(page: number, pageSize: number): void {
    const q = { ...this.query(), page, pageSize };
    this.query.set(q);
    this.loadDataList(q);
  }

  search(keyword: string): void {
    const q = { ...this.query(), pageNumber: 1, searchKeyword: keyword };
    this.query.set(q);
    this.loadDataList(q);
  }

  /**
   * 새로고침
   */
  reload(): void {
    this.resetAndReload(this.query().searchKeyword ?? '');
  }
}
