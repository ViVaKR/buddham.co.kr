import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  AfterViewInit, Component, computed, effect, ElementRef, inject,
  input, output, signal, viewChild,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { resolveEnumLabel } from '@app/core/enums/enum-utils';
import { IColumnDef } from '@app/core/interfaces/ui/i-column-def';
import { ISearchConfig } from '@app/core/interfaces/ui/i-search-config';
import { DetailCard } from '@app/layout/detail-card/detail-card';
import { ReplyBoard } from '@app/layout/reply-board/reply-board';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { EnumToKeyPipe } from '@app/core/pipes/enum-to-key-pipe';
import { IReply } from '@app/core/interfaces/ui/i-reply';
import { ILikeResponse } from '@app/core/interfaces/ui/i-like-response';
import { IThreadConfig } from '@app/core/interfaces/ui/i-thread-config';
import { ScrollTo } from '../scroll-to/scroll-to';

@Component({
  selector: 'cursor-accordion-table',
  imports: [
    CommonModule,
    ...MATERIAL_COMMON,
    ReplyBoard,
    DetailCard,
    EnumToKeyPipe,
    ScrollTo,
  ],
  templateUrl: './cursor-accordion-table.html',
  styleUrl: './cursor-accordion-table.scss',
})
export class CursorAccordionTable<
  T extends { id: string | number },
  U extends IReply = IReply,
  R extends ILikeResponse = ILikeResponse,
> implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly datePipe = inject(DatePipe);
  private readonly currencyPipe = inject(CurrencyPipe);

  anchorId = input<string | null>(null);
  // ---------------------------------------------------------
  // 📥 Inputs (Signals)
  // ---------------------------------------------------------
  detailUrl = input<string>();
  cols = input<IColumnDef[]>([]);
  data = input<T[]>([]);
  showSearch = input<boolean>(true);

  // 🚨 커서 페이징의 핵심 상태들
  hasMore = input<boolean>(false);
  isLoading = input<boolean>(false);
  totalCount = input<number>(0); // 첫 진입시 서버가 내려준 총 개수(있을때만 노출)
  isThreadMode = input<boolean>(false);

  threadConfig = input<IThreadConfig<T, U, R> | null>(null);

  // 🚀 무한 스크롤 토글 옵션 (true = 자동 스크롤 조회, false = 더보기 클릭 조회)
  enableInfiniteScroll = input<boolean>(true);
  searchConfig = input<ISearchConfig>({
    strategy: 'server',
    localThreshold: 1,
    serverThreshold: 2,
  });

  isServerSearchActive = input<boolean>(false);

  // ---------------------------------------------------------
  // 📤 Outputs (Events)
  // ---------------------------------------------------------
  searchChange = output<string>();
  currentData = output<T>();
  loadMore = output<void>();
  likeClick = output<T>(); // 좋아요 클릭 이벤트 위임

  // ---------------------------------------------------------
  // ⚙️ Internal State Signals
  // ---------------------------------------------------------
  readonly selectedItem = signal<T | null>(null);
  readonly expandedElement = signal<T | null>(null);
  readonly expandedCache = signal<Set<string | number>>(new Set());

  readonly dataSource = new MatTableDataSource<T>();

  // ViewChilds
  readonly sortor = viewChild<MatSort>(MatSort);
  readonly infiniteScrollTrigger = viewChild<ElementRef>('infiniteScrollTrigger');

  // 데이터 캐시 & 카우트 계산
  private readonly tabPropertiesCache = new Map<
    string,
    Array<{ key: string; label: string; value: any }>
  >();

  readonly currentCount = computed(() => this.data()?.length ?? 0);
  readonly displayedColumns = computed(() =>
    this.cols()
      .filter((c) => c.showInTable != false)
      .map((c) => c.key),
  );
  readonly displayedColumnsWithExpand = computed(() => [...this.displayedColumns(), 'expand']);

  readonly isExpanded = computed(() => {
    const expanded = this.expandedElement();
    return (element: T) => expanded === element;
  });

  constructor() {
    // 1️⃣ 데이터 변경 시 로컬 캐시 초기화 및 테이블 데이터소스 동기화
    effect(() => {
      const newData = this.data();
      this.tabPropertiesCache.clear();
      if (newData) {
        this.dataSource.data = newData;
      }
    });

    // 2️⃣ ⚡️ 생성자 안으로 안전하게 이사 온 무한 스크롤 이펙트!
    // effect의 인자로 제공되는 onCleanup을 사용하면 중복 업저버나 메모리 누수를 아주 우아하게 방어할 수 있다네.
    effect((onCleanup) => {
      const trigger = this.infiniteScrollTrigger();
      const scrollActive = this.enableInfiniteScroll();

      if (trigger && scrollActive) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            // 화면에 닿았고, 로딩 중이 아니고, 다음 페이지가 더 있을 때 자동 로드
            if (entry.isIntersecting && !this.isLoading() && this.hasMore()) {
              this.onLoadMore();
            }
          },
          {
            rootMargin: '200px', // 200px 전에 미리 스무스하게 땡겨오기
            threshold: 0.1,
          },
        );

        observer.observe(trigger.nativeElement);

        // 💡 이펙트가 재호출되거나 컴포넌트가 파괴될 때 이전 Observer를 알아서 청소(Cleanup)해준다네!
        onCleanup(() => {
          observer.disconnect();
        });
      }
    });
  }

  ngAfterViewInit(): void {
    const sort = this.sortor();
    if (sort) {
      this.dataSource.sort = sort;
    }
  }

  onLoadMore() {
    this.loadMore.emit();
  }

  toggle(element: T & { id: string | number }) {
    const current = this.expandedElement();
    if (current === element) {
      this.expandedElement.set(null);
      this.selectedItem.set(null);
      return;
    }

    this.selectedItem.set(element);
    this.expandedElement.set(element);

    this.expandedCache.update((set) => {
      const next = new Set(set);
      next.add(element.id);
      return next;
    });
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const trimmed = value.trim();
    const config = this.searchConfig();
    if (!trimmed) {
      this.dataSource.filter = '';
      this.searchChange.emit('');
      return;
    }

    // 1. 로컬 필터링 조건
    if (config.strategy === 'local' || trimmed.length < config.serverThreshold) {
      this.dataSource.filter = trimmed.toLocaleLowerCase();
      return;
    }

    // 2. 서버 FTS 검색 조건
    // 검색어 입력 후 300ms 디바운스는 서비스단에서 완벽 처리
    this.dataSource.filter = '';
    this.searchChange.emit(trimmed);
  }

  getTabProperties(element: T): Array<{ key: string; label: string; value: any }> {
    const cacheKey = String(element.id);

    if (this.tabPropertiesCache.has(cacheKey)) {
      return this.tabPropertiesCache.get(cacheKey)!;
    }

    const properties = this.cols()
      .filter((col) => col.showInTab != false)
      .sort((a, b) => (a.tabOrder ?? 999) - (b.tabOrder ?? 999))
      .map((col) => ({
        key: col.key,
        label: col.tabLabel || col.label,
        value: this.formatValue(element, col),
      }));
    this.tabPropertiesCache.set(cacheKey, properties);

    return properties;
  }

  formatValue(element: T, col: IColumnDef): string {
    const rawValue = (element as any)[col.key];
    if (rawValue === null || rawValue === undefined) return '';
    switch (col.pipe) {
      case 'date':
        return this.datePipe.transform(rawValue, col.pipeArgs || 'yyyy-MM-dd') || String(rawValue);
      case 'currency':
        return this.currencyPipe.transform(rawValue, col.pipeArgs || 'KRW') || String(rawValue);
      case 'enum':
        return resolveEnumLabel(rawValue, col.enumType ?? '', col.pipeArgs);
      case 'truncate':
        return String(rawValue);
      default:
        return String(rawValue);
    }
  }

  onRowClick(t: T) {
    this.currentData.emit(t);
  }

  onLikedClick(element: T): void {
    this.likeClick.emit(element);
  }

  goTo(id: string | number) {
    this.router
      .navigate([this.detailUrl(), id], {
        queryParams: { returnUrl: this.router.url },
      })
      .then((isSuccess) => {
        if (!isSuccess) {
          // 이동 실패 했다면 가드에 막혔을 확률이 높으이 안내 메시지를 띄움
        }
      });
  }

  searchTooltip(tip: string): string {
    return `데이터 (${tip} 중에서 검색...)`;
  }
}
