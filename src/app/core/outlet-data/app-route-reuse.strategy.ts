import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

/**
 * ┌─────────────────────────────────────────────────────┐
 * │  AppReuseStrategy                                   │
 * │  라우트 재사용 전략 - 스크롤 위치 유지                  │
 * │                                                     │
 * │  사용법: route data 에 reuse: true 추가               │
 * │  {                                                  │
 * │    path: 'sutra-list',                              │
 * │    component: SutraListComponent,                   │
 * │    data: { reuse: true }   ← 이거 하나면 끝!          │
 * │  }                                                  │
 * └─────────────────────────────────────────────────────┘
 */
@Injectable({ providedIn: 'root' })
export class AppReuseStrategy implements RouteReuseStrategy {

    private cahce = new Map<string, DetachedRouteHandle>();

    /** 같은 라우트 설정이면 재사용 */
    shouldReuseRoute(
        future: ActivatedRouteSnapshot,
        curr: ActivatedRouteSnapshot
    ): boolean {
        return future.routeConfig === curr.routeConfig;;
    }

    /** data.reuse === ture 인 라우트만 저장 */
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return route.data['reuse'] === true;
    }

    /** 캐시에 저장 */
    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        const key = this.getKey(route);
        if (key) this.cahce.set(key, handle);
    }

    /** 캐시에서 가져오기 */
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        const key = this.getKey(route);
        return !!key && this.cahce.has(key);
    }

    /** 캐시에서 가져오기 */
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        const key = this.getKey(route);
        return key ? (this.cahce.get(key) ?? null) : null;
    }

    /** 특정 라우트 캐시 수동 삭제 (새로고침 필요시) */
    public clearCache(path: string): void {
        this.cahce.delete(path);
    }


    /** 전체 캐시 초기화 */
    public clearAll(): void {
        this.cahce.clear();
    }

    private getKey(route: ActivatedRouteSnapshot): string {
        return route.routeConfig?.path ?? '';
    }
}
