import { inject, Injectable, Service } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { OutletData } from './outlet-data.model';

/**
 * ┌─────────────────────────────────────────────────────┐
 * │  OutletEventService                                 │
 * │  라우터 아웃렛 이벤트 핸들러                         │
 * │  activate  → 컴포넌트 진입시                        │
 * │  deactivate→ 컴포넌트 이탈시                        │
 * └─────────────────────────────────────────────────────┘
 */
@Service()
export class OutletEventService {

    private title = inject(Title);
    private meta = inject(Meta);
    private router = inject(Router);

    /**
     * 컴포넌트 활성화 시
     * 템플릿: (activate)="outletEvent.onActivate($event)"
     */
    public onActivate(component: unknown): void {

        // 1. 스크롤 최상단 이동
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 1.현재 활성화된 라우트의 데이터를 찾아 오기
        const data = this.getRouteData();
        const outletData = data?.['outletData'] as OutletData | undefined;

        // 2. 타이틀 변경
        // 컴포넌트에 pageTitle 속성 있으면 그걸로, 없으면 라우트 설정의 title
        const pageTitle = outletData?.title
            || (component as Record<string, unknown>)['pageTitle']
            || data?.['title'];

        if (typeof pageTitle === 'string')
            this.title.setTitle(pageTitle);

        // 3. SEO 메타 태그 자동 적용
        if (outletData?.meta) {
            const { description, keywords, ogImage } = outletData.meta;
            if (description) this.meta.updateTag({ name: 'description', content: description });
            if (keywords) this.meta.updateTag({ name: 'keywords', content: keywords });
            if (ogImage) this.meta.updateTag({ property: 'og:image', content: ogImage });
        }
    }

    private getRouteData(): Record<string, unknown> | null {
        let route = this.router.routerState.snapshot.root;
        while (route.firstChild) { route = route.firstChild; }
        return route.data || null;
    }

    onDeactivate(component: unknown): void { }
}