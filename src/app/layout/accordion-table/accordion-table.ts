import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
  ChangeDetectionStrategy,
  model,
} from '@angular/core';
import { EnumToKeyPipe } from '@app/core/pipes/enum-to-key-pipe';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { ReplyBoard } from '../reply-board/reply-board';
import { DetailCard } from '@app/layout/detail-card/detail-card';
import { IReply } from '@app/core/interfaces/ui/i-reply';
import { ILikeResponse } from '@app/core/interfaces/ui/i-like-response';
import { Router } from '@angular/router';
import { IColumnDef } from '@app/core/interfaces/ui/i-column-def';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { resolveEnumLabel } from '@app/core/enums/enum-utils';
import { IThreadConfig } from '@app/core/interfaces/ui/i-thread-config';
import { ISearchConfig } from '@app/core/interfaces/ui/i-search-config';

@Component({
  selector: 'accordion-table',
  imports: [CommonModule, ...MATERIAL_COMMON, EnumToKeyPipe, ReplyBoard, DetailCard],
  templateUrl: './accordion-table.html',
  styleUrl: './accordion-table.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [DatePipe, CurrencyPipe],
})
export class AccordionTable<
  T extends { id: string | number },
  U extends IReply = IReply,
  R extends ILikeResponse = ILikeResponse,
> implements AfterViewInit {
  private router = inject(Router);

  // ── Inputs ───────────────────────────────────────────────
  detailUrl = input<string>();
  pageSize = input<number>(10);
  cols = input<IColumnDef[]>([]);
  data = input<T[]>([]);
  showSearch = input<boolean>(true);
  totalItems = input<number>(0);
  currentPage = input<number>(1); // 1-based (서버 기준)
  isThreadMode = input<boolean>(false); // 쓰레드 형식 여부
  isLoading = input<boolean>(false);
  threadConfig = input<IThreadConfig<T, U, R> | null>(null);

  searchConfig = input<ISearchConfig>({
    strategy: 'local',
    localThreshold: 1,
    serverThreshold: 2,
  });
  // 서버 검색 활성 여부 - input 으로 받아서 UI 만 표현
  isServerSearchActive = input<boolean>(false);

  // ── Outputs ──────────────────────────────────────────────
  searchChange = output<string>(); // 키워드 변경 → 부모가 처리
  pageChange = output<number>(); // 페이지 번호 → 부모가 처리
  loadMore = output<void>(); // 더보기 → 부모가 처리
  currentData = output<T>();
  likeClick = output<T>();

  readonly selectedItem = signal<T | null>(null);

  currentCount = computed(() => this.data()?.length);
  hasMore = computed(() => this.currentCount() < this.totalItems());

  page = viewChild<MatPaginator>(MatPaginator);
  sortor = viewChild<MatSort>(MatSort);

  expandedCache = signal<Set<string>>(new Set());
  expandedElement = signal<T | null>(null);

  readonly dataSource = new MatTableDataSource<T>();

  readonly displayedColumns = computed(() =>
    this.cols()
      .filter((c) => c.showInTable !== false)
      .map((c) => c.key),
  );

  displayedColumsWithExpand = computed(() => [...this.displayedColumns(), 'expand']);

  isExpanded = computed(() => {
    const expanded = this.expandedElement();
    return (element: T) => expanded === element;
  });

  // 🔥 메모이제이션된 탭 데이터
  private tabPropertiesCache = new Map<string, Array<{ key: string; label: string; value: any }>>();

  currontPage = model<number>(0);
  previousDataLength = signal<number>(0);

  constructor(
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
  ) {
    effect(() => {
      const newData = this.data();
      this.tabPropertiesCache.clear();
      if (newData) this.dataSource.data = newData;
    });
  }

  ngAfterViewInit() {
    const paginator = this.page();
    const sort = this.sortor();
    if (!paginator || !sort) return;
    this.dataSource.paginator = paginator;
    this.dataSource.sort = sort;
  }

  // ── 검색: 그냥 emit만 ────────────────────────────────────
  onSearchInput(value: string): void {
    this.searchChange.emit(value.trim());
  }

  // ── 페이지 변경 ───────────────────────────────────────────
  onPageChange(event: PageEvent): void {
    // mat-paginator => 0-based
    // Server =>  1-based
    this.pageChange.emit(event.pageIndex + 1);
  }

  onLoadMore(): void {
    this.loadMore.emit();
  }

  enumToString(col: any) {
    return Object.keys(col);
  }

  getTabProperties(element: T): Array<{ key: string; label: string; value: any }> {
    const cacheKey = String(element.id);

    if (this.tabPropertiesCache.has(cacheKey)) return this.tabPropertiesCache.get(cacheKey)!;

    const properties = this.cols()
      .filter((col) => col.showInTab !== false)
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
        return this.formatEnumValue(rawValue, col);

      case 'truncate':
        return String(rawValue);

      default:
        return String(rawValue);
    }
  }

  searchTooltip(tip: string): string {
    return `데이터 (${tip}) 중에서 검색...`;
  }

  toggle(element: T & { id: string }) {
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

  formatEnumValue(value: any, col: IColumnDef): string {
    return resolveEnumLabel(value, col.enumType!, col.pipeArgs);
  }

  formatCellValue(value: any, col: IColumnDef): string {
    if (!col.pipe) return value;

    switch (col.pipe) {
      case 'date':
        return this.datePipe.transform(value, col.pipeArgs || 'yyyy-MM-dd') || value;
      case 'currency':
        return this.currencyPipe.transform(value, col.pipeArgs || 'KRW') || value;
      default:
        return value;
    }
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

    console.log('-->', config.strategy);

    if (config.strategy == 'local' || trimmed.length < config.serverThreshold) {
      this.dataSource.filter = trimmed.toLowerCase();
      return;
    }
    // 3. 서버 FTS 임계값 이상 -> 서버 요청
    this.dataSource.filter = '';
    this.searchChange.emit(trimmed);
    this.dataSource.paginator?.firstPage();
  }

  onRowClick(t: T): void {
    this.currentData.emit(t);
  }

  onLikedClick(t: T): void {
    this.likeClick.emit(t);
  }

  goTo(id: string | number) {
    this.router
      .navigate([this.detailUrl(), id], {
        queryParams: { returnUrl: this.router.url },
      })
      .then((r) => {
        console.log(r);
      });
  }
}
