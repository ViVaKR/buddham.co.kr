import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { resolveEnumLabel } from '@app/core/enums/enum-utils';
import { IEntity } from '@app/core/interfaces/base/i-entity';
import { IColumnDef } from '@app/core/interfaces/ui/i-column-def';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';

@Component({
  selector: 'detail-card',
  imports: [CommonModule, ...MATERIAL_COMMON],
  templateUrl: './detail-card.html',
  styleUrl: './detail-card.scss',
  providers: [DatePipe, CurrencyPipe],
})
export class DetailCard<T extends IEntity> {
  data = input.required<T>();
  cols = input.required<IColumnDef[]>();
  readonly el = computed(() => this.data() as any);

  // 1. 헤더용: 주로 제목과 약어
  readonly headerCols = computed(() => this.cols().filter((c) => c.position === 'header'));

  // 1-2. 부제목
  readonly subHeaderCols = computed(() => this.cols().filter((c) => c.position === 'sub-header'));

  // 2. 뱃지용: Tier, 카테고리 등
  readonly badgeCols = computed(() => this.cols().filter((c) => c.position === 'badge'));

  // 3. 본문
  readonly contentCols = computed(() => this.cols().filter((x) => x.position === 'content'));

  // 4. 본문 그리드용: 권/장/절/수 등 수치 데이터
  readonly gridCols = computed(() =>
    this.cols().filter((c) => !c.position || c.position === 'grid'),
  );

  // 5. 바닥글
  readonly footerCols = computed(() => this.cols().filter((x) => x.position === 'footer'));

  constructor(
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
  ) { }

  ngOnInit() {
    console.log('---> ', this.data())
  }

  /**
   *  '1억 개 필드'를 위한 차세대 포맷터
   * @param element 데이터 객체 (T)
   * @param col 컬럼 정의 (IColumnDef)
   */
  formatValue(element: T, col: IColumnDef): string {

    const value = element[col.key];

    // 1. 공허의 영역 (null/undefined 처리)
    if (value === null || value === undefined || value === '') {
      return col?.defaultValue ?? '-'; // 설정에 기본값이 있으면 쓰고, 없으면 대시(-)
    }

    // 2. 사령관님의 '필살기' 파이프 처리 (Switch-Case 전략)
    if (col.pipe) {
      switch (col.pipe) {
        case 'date':
          return this.datePipe.transform(value, col.pipeArgs || 'yyyy-MM-dd') || String(value);

        case 'currency':
          return this.currencyPipe.transform(value, col.pipeArgs || 'KRW') || String(value);

        case 'enum':
          return resolveEnumLabel(value, col.enumType!, col.pipeArgs) || String(value);

        case 'truncate':
          const limit = col.pipeArgs ? parseInt(col.pipeArgs) : 20;
          return value.length > limit ? value.slice(0, limit) + '...' : value;

        case 'uppercase':
          return String(value).toUpperCase();

        case 'lowercase':
          return String(value).toLowerCase();

        case 'active':
          return value ? '정회원' : '비회원';

        case 'roles':
          if (!Array.isArray(value) || value.length === 0)
            return col?.defaultValue ?? '-';
          const lang = col.pipeArgs ?? 'ko';
          return value
            .map((r: any) => r[lang] ?? r.en ?? '-')
            .join(', ');

        case 'titlecase':
          return String(value)
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');

        default:
          return String(value);
      }
    }

    // 3. 타입별 자동 감지 (Smart Sensing)
    if (typeof value === 'boolean') {
      return value ? '✅' : '❌'; // 불리언은 직관적인 아이콘으로!
    }

    if (Array.isArray(value)) {
      return value.join(', '); // 배열은 콤마로 연결
    }

    // 4. 숫자 데이터에 접미사(Suffix) 결합 (예: 108 + "배")
    if (typeof value === 'number' && col.unit) {
      return `${value.toLocaleString()}${col.unit}`;
    }

    return String(value);
  }
}
