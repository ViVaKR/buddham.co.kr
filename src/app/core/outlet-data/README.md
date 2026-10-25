# BUDDHAM Router Utilities

# Angular 라우터 유틸리티 모음

## 📁 파일 구조

```
buddham-router/
├── app-route-reuse.strategy.ts   ← 스크롤 위치 유지
├── outlet-data.model.ts          ← 레이아웃 데이터 타입
├── outlet-event.service.ts       ← activate/deactivate 이벤트
├── USAGE.ts                      ← 전체 사용 예시
└── README.md                     ← 지금 이 파일
```

---

## 🚀 적용 순서

### 1단계 - app.config.ts 에 등록

```typescript
{
  provide:  RouteReuseStrategy,
  useClass: AppReuseStrategy,
}
```

### 2단계 - 재사용할 라우트에 표시

```typescript
data: {
  reuse: true;
} // 경전 목록 등
```

### 3단계 - app.component.html 아웃렛 연결

```html
<router-outlet
  [routerOutletData]="currentOutletData()"
  (activate)="outletEvent.onActivate($event)"
  (deactivate)="outletEvent.onDeactivate($event)"
/>
```

### 4단계 - 자식 컴포넌트에서 데이터 수신

```typescript
outletData = injectOutletData();
// 템플릿: {{ outletData().layout }}
```

---

## 🪷 레이아웃 타입

| 타입    | 용도              |
| ------- | ----------------- |
| default | 기본 페이지       |
| full    | 풀스크린          |
| sidebar | 사이드바 포함     |
| prayer  | 예불              |
| writing | 사경 - 일필(一筆) |
| dharma  | 법문              |
| gallery | 갤러리            |

---

## 💡 캐시 수동 제어

```typescript
// 특정 페이지 캐시 삭제 (강제 새로고침)
reuseStrategy.clearCache('sutra/list');

// 전체 초기화 (로그아웃 시)
reuseStrategy.clearAll();
```

---

## 사용법

```typescript
// ================================================================
//  app.config.ts  - RouteReuseStrategy 등록
// ================================================================
import { ApplicationConfig } from '@angular/core';
import {
  provideRouter,
  RouteReuseStrategy,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';
import { routes } from './app.routes';
import { AppReuseStrategy } from './buddham-router/app-route-reuse.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(), // 페이지 전환 애니메이션
    ),
    {
      provide: RouteReuseStrategy,
      useClass: AppReuseStrategy, // ← 등록 끝!
    },
  ],
};

// ================================================================
//  app.routes.ts  - 라우트 설정 예시
// ================================================================
import { Routes } from '@angular/router';
import { OutletData } from './buddham-router/outlet-data.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component'),
    data: {
      reuse: false,
      outletData: {
        layout: 'default',
        title: '홈',
      } satisfies OutletData,
    },
  },
  {
    path: 'sutra',
    data: {
      outletData: {
        layout: 'sidebar',
        title: '경전',
        showHeader: true,
      } satisfies OutletData,
    },
    children: [
      {
        path: 'list',
        loadComponent: () => import('./pages/sutra/sutra-list.component'),
        data: {
          reuse: true, // ← 스크롤 위치 유지!
          outletData: {
            layout: 'sidebar',
            title: '경전 목록',
          } satisfies OutletData,
        },
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/sutra/sutra-detail.component'),
        data: {
          reuse: false, // 상세는 항상 새로 로드
          outletData: {
            layout: 'full',
            title: '경전 보기',
          } satisfies OutletData,
        },
      },
    ],
  },
  {
    path: 'ilpil', // 일필(一筆) 사경
    loadComponent: () => import('./pages/ilpil/ilpil.component'),
    data: {
      reuse: false,
      outletData: {
        layout: 'writing', // 사경 전용 레이아웃
        theme: 'sepia', // 따뜻한 색감
        showFooter: false, // 집중을 위해 푸터 숨김
        title: '일필(一筆)',
      } satisfies OutletData,
    },
  },
];

// ================================================================
//  app.component.ts  - 아웃렛 이벤트 연결
// ================================================================
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OutletEventService } from './buddham-router/outlet-event.service';
import { OutletData, DEFAULT_OUTLET_DATA } from './buddham-router/outlet-data.model';
import { signal } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet
      [routerOutletData]="currentOutletData()"
      (activate)="outletEvent.onActivate($event)"
      (deactivate)="outletEvent.onDeactivate($event)"
    />
  `,
})
export class AppComponent {
  outletEvent = inject(OutletEventService);
  currentOutletData = signal<OutletData>(DEFAULT_OUTLET_DATA);
}

// ================================================================
//  sutra-list.component.ts  - 자식에서 데이터 받기
// ================================================================
import { Component, computed } from '@angular/core';
import { injectOutletData } from './buddham-router/outlet-data.model';

@Component({
  selector: 'app-sutra-list',
  standalone: true,
  template: `
    <div [class]="'layout-' + outletData().layout">
      <h1>{{ outletData().title }}</h1>
      <!-- 경전 목록 -->
    </div>
  `,
})
export class SutraListComponent {
  pageTitle = '경전 목록'; // OutletEventService 타이틀용
  outletData = injectOutletData(); // ← 한줄로 끝!

  isSidebar = computed(() => outletData().layout === 'sidebar');
}
```

---

## 테마

- app.html 에서 nav bar 사용법 예시

```html
<div
  class="w-full min-h-dvh flex flex-col transition-colors duration-500"
  [class.theme-sepia]="currentOutletData().theme === 'sepia'"
  [class.theme-dark]="currentOutletData().theme === 'dark'"
>
  <menu-bar />
  ...
</div>
```

- 세피아 모드에서 사용할 색상을 변수로 등록해두면 CSS에서 var(--...)로 호출하기 편함..

```scss
/* tailwindcss 설정 부분 */
@theme {
  /* ... 기존 설정 ... */
  --color-sepia-paper: #f4ecd8;
  --color-sepia-ink: #433422;
}

@layer utilities {
  .bg-sepia {
    background-color: var(--color-sepia-paper);
    color: var(--color-sepia-ink);
  }
}
```

---

_BUDDHAM.CO.KR - 일필(一筆) 🪷_
