import { HttpParams } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RsCode } from '@app/core/enums/rs-code';
import { ICursorPagedQuery } from '@app/core/interfaces/api/i-query';
import { ICursorResponse } from '@app/core/interfaces/api/i-response';
import { BaseGenericService } from '@app/core/services/base/base-generic-service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  skip,
  switchMap,
  tap,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export abstract class BaseCursorPagedService<TView, TPayload> extends BaseGenericService<
  TView,
  TPayload
> {
  // ---------------------------------------------------------
  // 쿼리 초기화
  // ---------------------------------------------------------
  private readonly INITIAL_QUERY: Readonly<ICursorPagedQuery> = {
    cursor: '',
    size: 20,
    searchKeyword: '',
  };

  private readonly INITIAL_STATE: Readonly<ICursorResponse<never>> = {
    content: [],
    nextCursor: '',
    hasMore: false,
    totalCount: 0,
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

  // 🛠️ 자식 클래스(BaseCursorPagedService 등)에 추가할 세련된 무기
  /** * 💡 목록 조회 중(isLoading)이거나, CUD 변경 중(isMutating)일 때
   * 둘 중 하나라도 참이면 컴포넌트는 무조건 "나 바빠요!" 상태가 됨.
   */
  readonly isPending = computed(() => this.isLoading() || this.isMutating());
  /**
   * query signal 변경 → debounce → 자동 목록 조회
   * cursor: '' 이면 새 조회, 값이 있으면 다음 페이지 append
   */
  readonly query = signal<ICursorPagedQuery>({ ...this.INITIAL_QUERY });

  readonly state = signal<ICursorResponse<TView>>({
    ...(this.INITIAL_STATE as ICursorResponse<TView>),
  });

  // ---------------------------------------------------------
  // Computed (state에서 파생 - 외부 직접 구독용)
  // ---------------------------------------------------------
  readonly items = computed(() => this.state().content ?? []);
  readonly nextCursor = computed(() => this.state().nextCursor ?? '');
  readonly hasMore = computed(() => this.state().hasMore);
  readonly totalCount = computed(() => this.state().totalCount);
  readonly isEmpty = computed(() => !this.isLoading() && this.items().length === 0);

  constructor() {
    super();

    // 1. CUD 트리거 시그널을 관찰하다가 변경이 감지되면 쿼리를 초기화해버림!
    toObservable(this.mutatedTrigger)
      .pipe(
        skip(1), // 컴포넌트 처음 켜질 때의 초기값(0)은 가볍게 씹어줌
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        // 생성/수정/삭제 성공 시 쿼리를 초기화하여 자동으로 첫 페이지부터 갱신되도록 유도
        this.query.set({ ...this.INITIAL_QUERY });
      });

    // 2. 기존 목록 조회 메인 스트림은 그대로 평화롭게 유지
    toObservable(this.query)
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        tap(() => {
          this.isLoading.set(true);
          this.loader.show();
        }),
        switchMap((q) => this._fetchList$(q)),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (result) => {
          if (!result) return;
          const { res, append } = result;
          this.state.update((prev) => ({
            ...res,
            content: append
              ? [...(prev.content ?? []), ...(res.content ?? [])]
              : (res.content ?? []),
          }));
          this.isLoading.set(false);
          this.loader.hide();
        },
      });
  }

  // ---------------------------------------------------------
  // Private: 실제 HTTP 요청 (Observable 반환)
  // ---------------------------------------------------------
  private _fetchList$(
    q: ICursorPagedQuery,
  ): Observable<{ res: ICursorResponse<TView>; append: boolean } | null> {
    // cursor가 있으면 다음 페이지 append, 없으면 새 조회
    const append = !!q.cursor;

    let params = new HttpParams().set('cursor', q.cursor ?? '').set('size', String(q.size ?? 20));

    if (q.searchKeyword?.trim()) {
      params = params.set('searchKeyword', q.searchKeyword.trim());
    }

    return this.http
      .get<ICursorResponse<TView>>(`${this.apiBase}/GetCursorPagedList`, { params })
      .pipe(
        map((res) => ({ res, append })),

        // 여기서 에러를 가로채서 안전한 데이터(null) 로 치환해 던져야
        // 메인 스트림이 영원히 영생함
        catchError((err) => {
          this.error.set(err);
          this.isLoading.set(false);
          this.loader.hide();
          return of(null);
        }),
      );
  }

  // ---------------------------------------------------------
  // Public API
  // ---------------------------------------------------------

  /**
   * [검색] 검색어 변경 → cursor 초기화 후 새 조회
   */
  search(keyword: string): void {
    this.query.update(() => ({ ...this.INITIAL_QUERY, searchKeyword: keyword.trim() }));
  }

  /**
   * 다음 페이지 로드 (무한스크롤 트리거)
   * 기본 목록에 추가
   * - hasMore / isLoading 가드 포함
   */
  loadMore(): void {
    if (this.isLoading() || !this.hasMore()) return;
    this.query.update((q) => ({ ...q, cursor: this.nextCursor() }));
  }

  /**
 * 버튼 페이징용 - 교체 + 상단 이동
 */
  loadNextPage(): void {
    if (this.isLoading() || !this.hasMore()) return;
    this.query.update((q) => ({
      ...q,
      cursor: this.nextCursor(),
      append: false  // ✅ 교체!
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  /**
   * 전체 초기화 후 재조회 (CRUD 후 목록 갱신)
   */
  reload(): void {
    this.query.set({ ...this.INITIAL_QUERY });
  }

  /**
   * CRUD mutation 후 자동 호출되는 훅
   */
  protected override onMutated(): void {
    /* this.reload(); */
  }
}
