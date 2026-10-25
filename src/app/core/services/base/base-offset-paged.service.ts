import { HttpParams } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FixedOrder } from '@app/core/enums/fixed-order';
import { RsCode } from '@app/core/enums/rs-code';
import { IOffsetPagedQuery } from '@app/core/interfaces/api/i-query';
import { IOffsetResponse } from '@app/core/interfaces/api/i-response';
import { BaseGenericService } from '@app/core/services/base/base-generic-service';
import { catchError, combineLatest, debounceTime, distinctUntilChanged, forkJoin, map, Observable, of, switchMap, tap, timer } from 'rxjs';

@Injectable()
export abstract class BaseOffsetPagedService<TView, TPayload>
  extends BaseGenericService<TView, TPayload> {

  // ---------------------------------------------------------
  // 초기값 (변이 금지 - 리셋 기준값)
  // ---------------------------------------------------------
  private readonly INITIAL_QUERY: Readonly<IOffsetPagedQuery> = {
    pageSize: 10,
    pageNumber: 1,
    fixedOrder: FixedOrder.NotFixed,
    searchKeyword: '',
    sortBy: '',
  };

  private readonly INITIAL_STATE: Readonly<IOffsetResponse<never>> = {
    content: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
    isSuccess: false,
    message: '',
    code: RsCode.NoContent,
    processedAt: '',
    meta: undefined,
    validationErrors: undefined,
    traceId: '',
  };

  // ---------------------------------------------------------
  // State Signals
  // ---------------------------------------------------------
  readonly isLoading = signal(false);
  readonly error = signal<any>(null);
  readonly query = signal<IOffsetPagedQuery>({ ...this.INITIAL_QUERY });

  readonly state = signal<IOffsetResponse<TView>>({
    ...(this.INITIAL_STATE as IOffsetResponse<TView>)
  });

  // ---------------------------------------------------------
  // Computed
  // ---------------------------------------------------------
  readonly items = computed(() => this.state().content ?? []);
  readonly totalCount = computed(() => this.state().totalCount);
  readonly totalPages = computed(() => this.state().totalPages);
  readonly currentPage = computed(() => this.state().page);
  readonly pageSize = computed(() => this.state().pageSize);
  readonly hasNext = computed(() => this.state().hasNext);
  readonly hasPrev = computed(() => this.state().hasPrev);
  readonly isEmpty = computed(() => !this.isLoading() && this.items().length === 0);
  readonly pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  // ---------------------------------------------------------
  // Constructor: query 변경 → switchMap → 자동 로드
  // ---------------------------------------------------------
  constructor() {
    super();

    // query 시그널과 mutatedTrigger 시그널 중 '하나라도' 바뀌면 자동으로 스트림이 흐름!
    const query$ = toObservable(this.query);
    const trigger$ = toObservable(this.mutatedTrigger);

    combineLatest([query$, trigger$]).pipe(
      debounceTime(500),
      // distinctUntilChanged 족쇄는 query 객체 비교용으로 그대로 유지
      // "직전 데이터와 완벽히 '똑같은 데이터'가 파이프라인에 또 흘러들어오면, 아래에 있는 무거운 작업(HTTP 서버 요청 등)을 실행하지 말고 과감히 씹어버려라!"
      // distinctUntilChanged(([a], [b]) => JSON.stringify(a) === JSON.stringify(b)),

      /*
        distinctUntilChanged는 원래 "중복 요청을 막아 서버를 보호하자"는 아주 선한 철학을 가진 녀석이었지만, 우리가 '쿼리'만 비교 대상으로 묶어두는 바람에 "데이터가 변했다는 신호(Trigger)"를 인지하지 못하는 똥고집 경비원이 되었던 거였어. 비교 영역을 확장해 줌으로써 비로소 완벽한 리액티브 스트림이 완성된 거지!
        철학적 배경까지 싹 이해하고 나니 이 RxJS라는 녀석들이 얼마나 정교하게 짜 맞춘 톱니바퀴인지
      */

      // 그래서 우리가 이 오만한 경비원에게 새로운 지침을 하달해 준 거야.
      // "야 경비원! 너 앞으로는 쿼리 조건만 보지 말고, 뒤에 붙어있는 트리거 카운트(trigger)까지 같이 묶어서 검사해!"
      distinctUntilChanged(
        ([prevQuery, prevTrigger], [currQuery, currTrigger]) =>
          JSON.stringify(prevQuery) === JSON.stringify(currQuery) && prevTrigger === currTrigger
      ),
      tap(() => {
        this.isLoading.set(true);
        this.loader.show();
      }),
      // 구조 분해 할당으로 오직 query(q) 값만 fetchList$에 배달!
      switchMap(([q]) => this._fetchList$(q)),
      takeUntilDestroyed()
    ).subscribe(res => {
      if (res) this.state.set(res);
      this.isLoading.set(false);
      this.loader.hide();
    });
  }

  // ---------------------------------------------------------
  // Private: 실제 HTTP 요청 최소 시간 (0.5초)만 보장하는 함수
  // ---------------------------------------------------------
  private _fetchList$(q: IOffsetPagedQuery): Observable<IOffsetResponse<TView> | null> {

    let params = new HttpParams()
      .set('pageSize', String(q.pageSize))
      .set('pageNumber', String(q.pageNumber))
      .set('sortBy', q.sortBy?.trim() || 'createdAt')
      .set('fixedOrder', String(q.fixedOrder ?? FixedOrder.NotFixed));

    if (q.searchKeyword?.trim()) {
      params = params.set('searchKeyword', q.searchKeyword.trim());
    }

    const request$ = this.http.get<IOffsetResponse<TView>>(
      `${this.apiBase}/GetOffsetPagedList`, { params });

    // 최소 0.5초 로딩 창을 보여주기 위한
    // 가장 안전한 RxJS 조합 (forkJoin)
    return forkJoin([request$, timer(500)]).pipe(
      map(([res]) => res),
      catchError((err) => {
        this.error.set(err);
        return of(null);
      })
    );
  }

  // ---------------------------------------------------------
  // Public API
  // ---------------------------------------------------------

  /**
   * 검색어 변경 → 1페이지로 초기화 후 조회
   */
  search(keyword: string): void {
    this.query.update(() => ({
      ...this.INITIAL_QUERY,
      searchKeyword: keyword.trim(),
    }));
  }

  /**
   * 특정 페이지 이동
   */
  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages()) return;
    if (pageNumber === this.currentPage()) return; // 동일 페이지 중복 요청 방지

    this.query.update((q) => ({ ...q, pageNumber }));
  }

  /**
   * 다음 페이지
   */
  nextPage(): void {
    if (!this.hasNext()) return;
    this.goToPage(this.currentPage() + 1);
  }

  loadMore(): void {
    if (!this.hasNext()) return;
    this.goToPage(this.currentPage() + 1);
  }

  /**
   * 이전 페이지
   */
  prevPage(): void {
    if (!this.hasPrev()) return;
    this.goToPage(this.currentPage() - 1);
  }

  /**
   * 정렬 변경 → 1페이지로 초기화 후 조회
   */
  sortBy(field: string, order: FixedOrder = FixedOrder.NotFixed): void {
    this.query.update((q) => ({
      ...q,
      pageNumber: 1,
      sortBy: field,
      fixedOrder: order,
    }));
  }

  /**
   * 1페이지로 돌아가 재조회 (CRUD 후 갱신)
   */
  reload(): void {
    this.query.update((q) => ({ ...q, pageNumber: 1 }));
  }

  /**
   * 전체 초기화 후 재조회
   */
  reset(): void {
    this.query.set({ ...this.INITIAL_QUERY });
  }

  /**
   * CRUD mutation 후 자동 호출 훅
   */
  protected override onMutated(): void {
    this.reload();
  }
}
