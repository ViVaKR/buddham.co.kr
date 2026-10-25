import { CommonModule } from '@angular/common';
import {
  Component, computed, effect, ElementRef, inject,
  input, OnInit, signal, viewChild
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute, RouterLinkActive, RouterLinkWithHref, RouterOutlet } from '@angular/router';
import { BaseDirective } from '@app/core/directives/base.directive';
import { IMenuItem } from '@app/core/interfaces/i-menu-config';
import { MenuDataService } from '@app/core/services/menu/menu-data.service';
import { UiUxService } from '@app/core/services/ui/ui-ux.service';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { SplitAreaComponent, SplitComponent } from 'angular-split';
import { map } from 'rxjs';

@Component({
  selector: 'main-layout',
  imports: [
    RouterLinkWithHref,
    RouterLinkActive,
    RouterOutlet,
    CommonModule,
    ...MATERIAL_COMMON,
    SplitComponent,
    SplitAreaComponent,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export default class MainLayout implements OnInit {
  private readonly ACCORDION_STORAGE_KEY = 'viv_sidebar_opened_panels';

  public readonly base = inject(BaseDirective);
  title = input<string>('');
  home = input<string>('home');
  private readonly route = inject(ActivatedRoute);
  readonly menuServer = inject(MenuDataService);

  // ── UiService ────────────────────────────────────────
  uiuxService = inject(UiUxService);
  showLeft = this.uiuxService.showleft;

  enterClass = signal('enter-animation');
  dynamicMobileHeight = signal(0);

  menus = input<IMenuItem[] | null>(null);

  accordion = viewChild.required(MatAccordion);
  sidebarRef = viewChild<ElementRef>('sidebarContent');
  menuContent = viewChild<ElementRef>('menuContent');

  isMobile = this.uiuxService.isMobile;

  sidebarWidth = this.uiuxService.defaultSidebarSize;

  readonly openedPanels = signal<Set<number>>(new Set());

  private observer?: ResizeObserver; // ← 클래스 변수
  private heightObserver?: ResizeObserver; // 클래스 변수

  readonly shouldShowLeft = computed(() => {
    // 1. 모바일이면 라우트 의도고 나발이고 일단 무조건 처음엔 닫고 시작
    if (this.isMobile()) return false;

    // 2. 데스트톱이면?. 라우트가 허용했고 + 사용자가 강제로 닫지 않았을때만 보여준다.
    return this.uiuxService.routeShowLeft() && !this.uiuxService.userClosedLeft();
  });

  readonly currentSidebarWidth = computed(() => (this.shouldShowLeft() ? this.sidebarWidth() : 0));

  constructor() {
    effect(() => {
      this.uiuxService.setLeft(this.shouldShowLeft());
    });
  }

  ngOnInit(): void {
    const saved = sessionStorage.getItem(this.ACCORDION_STORAGE_KEY);
    if (saved) {
      try {
        const parsedIndexes: number[] = JSON.parse(saved);
        this.openedPanels.set(new Set(parsedIndexes));
      } catch {
        this.openedPanels.set(new Set(this.initOpenedPanels()));
      }
    } else {
      this.openedPanels.set(new Set(this.initOpenedPanels()));
    }
  }

  ngAfterViewInit(): void {
    this.measureSidebarWidth(); // 기존 가로 측정
    this.observeMobileHeight(); // 세로 높이 실시간 감시
  }

  mobileHeight() {
    return this.menuContent()?.nativeElement.clientHeight;
  }

  observeMobileHeight() {
    const el = this.menuContent()?.nativeElement;
    if (!el) return;

    // 세로 높이 변화를 실시간으로 감지하는 감시자 소집!
    this.heightObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (this.isMobile()) {
          const height = entry.contentRect.height;
          // 높이가 변할 때마다 시그널 업데이트! (as-split에 즉시 반영)
          this.dynamicMobileHeight.set(Math.ceil(height));
        }
      }
    });

    this.heightObserver.observe(el);
  }

  measureSidebarWidth() {
    const el = this.sidebarRef()?.nativeElement;
    if (!el) return;

    this.observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (width > 0) {
        this.sidebarWidth.set(Math.ceil(width));
      }
      this.observer?.disconnect();
    });
    this.observer?.observe(el);
  }

  /** 1-2. 왼쪽메뉴 구성  */
  private readonly routeGroups = toSignal(
    this.route.data.pipe(
      map((data) => {
        const keys: string[] = data['menuGroupKeys'] ?? [];
        const extra: (() => IMenuItem[]) | undefined = data['extraGroups'];
        const roleOverrides = data['roleOverrides'] ?? {};

        // 라우트에서 전달된 disabledOverrides 맵을 가져옵니다 (없으면 빈 객체)
        const disabledOverrides = data['disabledOverrides'] ?? {};

        // 1. 기본 그룹 생성
        const autoGroups: IMenuItem[] =
          keys.length > 0 ? this.base.menuService.createGroupsByKeys(keys, roleOverrides) : [];

        const manualGroups: IMenuItem[] = extra ? this.menuServer.filterGroups(extra()) : [];

        const combinedGroups = [...autoGroups, ...manualGroups];

        // 2. 생성된 그룹들의 children(하위 메뉴)에 disabledOverrides 상태 주입하기
        return combinedGroups.map((group) => {
          if (!group.children) return group;

          const originalChildrenFn = group.children;
          return {
            ...group,
            children: () => {
              const children = originalChildrenFn();
              return children.map((menu) => {
                // menu.en 이나 menu.key 등을 이용해 오버라이드 값이 true인지 확인
                const isOverridden = !!disabledOverrides[menu.en?.toLowerCase() || ''];
                return {
                  ...menu,
                  // 기존에 이미 disabled이거나, 오버라이드 상 true이면 비활성화
                  disabled: menu.disabled || isOverridden,
                };
              });
            },
          };
        });
      }),
    ),
    { initialValue: [] as IMenuItem[] },
  );

  /** 1-1. 왼쪽 메뉴 구성  */
  readonly resolvedGroups = computed<IMenuItem[]>(() => {
    const groups = this.routeGroups(); // ? 그룹만
    // 2. 라우트 그룹이 존재한다면 필터링 후 즉시 반환
    const filtered = groups && groups.length > 0 ? this.menuServer.filterGroups(groups) : [];
    if (filtered.length > 0) return filtered;

    // 3. 라우트 그룹이 없거나 필터 후 전멸했다면, Input()으로 들어온 폴백 메뉴 확인
    const m = this.menus();
    if (m && m.length > 0) {
      const fallbackGroup: IMenuItem[] = [
        {
          title: this.title(),
          children: () => this.menuServer.filterMenus(m),
          expanded: true,
          icon: undefined,
        },
      ];
      return fallbackGroup;
    }
    // 4. 둘 다 없으면 빈 사이드바
    return [];
  });

  // 🔥 초기 expanded 상태도 반영
  readonly initOpenedPanels = computed(() => {
    const set = new Set<number>();
    this.resolvedGroups().forEach((g, i) => {
      if (g.expanded) set.add(i);
    });
    return set;
  });

  onOpened(index: number): void {
    this.openedPanels.update((set) => {
      const next = new Set(set);
      next.add(index);
      // 상태가 바뀔 때마다. 세션 저장소에 직려화하여 보관
      sessionStorage.setItem(this.ACCORDION_STORAGE_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }

  onClosed(index: number): void {
    this.openedPanels.update((set) => {
      const next = new Set(set);
      next.delete(index);
      // 닫혔을 때도 반영
      sessionStorage.setItem(this.ACCORDION_STORAGE_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }

  onClickedMenuItem(event: MouseEvent) {
    event.preventDefault();
    if (this.isMobile()) {
      this.uiuxService.setLeft(false);
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.heightObserver?.disconnect();
  }
}
