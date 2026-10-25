import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MenuFooter } from '@layout/menu-footer/menu-footer';
import { MenuLoading } from '@app/layout/menu-loading/menu-loading';
import { MenuBar } from '@layout/menu-bar/menu-bar';
import { MatIcon } from '@angular/material/icon';
import { MenuBreadcrumb } from '@layout/menu-breadcrumb/menu-breadcrumb';
import { DEFAULT_OUTLET_DATA, OutletData } from '@app/core/outlet-data/outlet-data.model';
import { OutletEventService } from '@app/core/outlet-data/outlet-event.service';
import { UiUxService } from '@app/core/services/ui/ui-ux.service';
import { IconService } from '@app/core/services/ui/icon.service';
import { filter, map } from 'rxjs';
import { LoaderService } from '@app/core/services/ui/loader.service';

@Component({
  selector: 'viv-root',
  imports: [RouterOutlet, MenuFooter, MenuLoading, MenuBar, MatIcon, MenuBreadcrumb],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  outletData = signal<OutletData>(DEFAULT_OUTLET_DATA);
  outletEvent = inject(OutletEventService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  uiuxService = inject(UiUxService);
  iconService = inject(IconService);
  loader = inject(LoaderService);

  // 1. 아웃라인 아이콘
  // private matIconReg = inject(MatIconRegistry);
  showbar = this.uiuxService.showbar;
  showleft = this.uiuxService.showleft;
  showfooter = this.uiuxService.showfooter;

  loading = this.loader.loading;

  constructor() {
    this.iconService.registerIcons();
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        // 1. 수많은 라우터 이벤트 중 '페이지 전환이 완전히 끝났을 때'
        // NavigationEnd 만 골라냄
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          // 2. 라우터 스탭샷 트리의 맨 꼭대기 (Root) 를 추출
          let route = this.route.snapshot;
          // 3. 최하위 자식 라우트가 나올 때가지 파고 듭니다.
          while (route.firstChild) route = route.firstChild;
          // 4. 최종 자식 라우트에 등록된 data 객체를 반환
          return route.data;
        }),
      )
      .subscribe((data) => {
        // 5. 최하위 라우트 data에 'outletData' 가 있으면 쓰고, 없으면 (DEFAULT) 를 사용
        const outlet = (data['outletData'] as OutletData) ?? DEFAULT_OUTLET_DATA;

        // 상태 변수에 저장해둠
        this.outletData.set(outlet);

        // 6. data 에 'showBar' 설정이 있으면 그에 맞게 상다바/사이드 바 표시 여부를 서비스에 전달
        // 없으면 false
        this.uiuxService.setShowbar(data['showBar'] ?? false);

        // 7. 현재 페이지의 특성에 다라 왼쪽 메뉴(Left Bar)나
        // 하단 영역(Footer)을 보여줄지 말지 UI 상태를 제어합니다.
        this.uiuxService.setRouteLeft(outlet.showLeft ?? true); // ✅ 의도 저장
        this.uiuxService.setFooter(outlet.showFooter ?? true);
      });

    // 2. 아웃라인 아이콘
    // this.matIconReg.setDefaultFontSetClass('material-icons-outlined');
  }

  toggleMenu() {
    this.uiuxService.toggleLeft();
  }
}
