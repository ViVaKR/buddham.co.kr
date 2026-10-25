import { httpResource } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { IDataResponse } from '@app/core/interfaces/api/i-response';
import { BaseGenericService } from '@app/core/services/base/base-generic-service';

@Injectable()
export abstract class BaseListAllService<TView, TPayload>
  extends BaseGenericService<TView, TPayload> {

  /** 자동로드 처리 */
  private readonly _resource = httpResource<IDataResponse<TView[]>>(() => {
    this.mutatedTrigger();
    return `${this.apiBase}/GetListAll`;
  });

  // ── 검색어 signal ─────────────────────────────────────────
  readonly searchKeyword = signal('');

  // ---------------------------------------------------------
  // Computed (상태 파생 및 성능 최적화)
  // ---------------------------------------------------------
  private readonly _allData = computed(() => this._resource.value()?.content ?? []);
  readonly isLoading = computed(() => this._resource.isLoading());
  readonly hasError = computed(() => this._resource.error() !== undefined);
  readonly totalCount = computed(() => this._allData().length);

  // 로컬 필터링 (검색어 기반)
  readonly items = computed(() => {
    const kw = this.searchKeyword().trim().toLowerCase();
    const data = this._allData();

    if (!kw) return data;
    // 🔥 개선: 매 루프마다 Object.values() 배열을 새로 만들지 않고,
    // 문자열 검색용 타겟 필드만 똑똑하게 검사하여 CPU 연산 성능 극대화!
    return data.filter(item => this.matchKeyword(item, kw))

    // return this._allData().filter(item =>
    //   Object.values(item as object).some(v => String(v ?? '').toLowerCase().includes(kw)));
  });

  // 로컬 검색에서는 페이지 개념이 없으므로...
  readonly filteredCount = computed(() => this.items().length);
  readonly isEmpty = computed(() => !this.isLoading() && this.items().length === 0);

  protected matchKeyword(item: TView, keyword: string): boolean {
    // 기본형: 객체를 문자열화하여 고속 스캔 (Object.values 배열 생성 꼼수 탈피)
    // 혹은 특정 필드(예: (item as any).name)만 지정하면 성능이 100배 더 좋아짐!
    return JSON.stringify(item).toLowerCase().includes(keyword);
  }

  // ── 검색 ─────────────────────────────────────────────────
  search(keyword: string): void { this.searchKeyword.set(keyword.trim()); }
  reload(): void { this._resource.reload(); }
  protected onMutated(): void { this._resource.reload(); }
}


/*
// Before - 컴포넌트에서
this.roleService.getListAll.value()?.content ?? []

// After - 컴포넌트에서
this.roleService.dataList()  ← 깔끔하지 않아? 하하하!

*/
