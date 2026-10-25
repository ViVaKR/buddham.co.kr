import { BreakpointObserver } from '@angular/cdk/layout';
import { inject, Service, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppBreakpoints } from '@app/shared/constants/app.constants';
import { map } from 'rxjs';

@Service()
export class UiUxService {

  private breakpoint = inject(BreakpointObserver);
  private readonly STORAGE_LEFT_KEY = 'ui_show_left';

  isMobile = toSignal(this.breakpoint.observe(AppBreakpoints.Mobile).pipe(map(r => r.matches)));
  isTablet = toSignal(this.breakpoint.observe(AppBreakpoints.Tablet).pipe(map(r => r.matches)));
  isDesktop = toSignal(this.breakpoint.observe(AppBreakpoints.Desktop).pipe(map(r => r.matches)));

  defaultSidebarSize = signal<number>(275);
  private readonly _showbar = signal<boolean>(true);
  private readonly _showleft = signal<boolean>(true);
  private readonly _showfooter = signal<boolean>(true);
  private readonly _sidebarWidth = signal<number>(this.defaultSidebarSize());
  private readonly _userClosedLeft = signal<boolean>(this.getInitialClosedSate());
  private readonly _routeShowLeft = signal<boolean>(true);

  // 2. 외부에서는 읽기 전용 시그널로만 접근 (asReadonly)
  readonly showbar = this._showbar.asReadonly();
  readonly showleft = this._showleft.asReadonly();
  readonly showfooter = this._showfooter.asReadonly();
  readonly sidebarWidth = this._sidebarWidth.asReadonly();
  readonly routeShowLeft = this._routeShowLeft.asReadonly();
  readonly userClosedLeft = this._userClosedLeft.asReadonly();

  setShowbar(state: boolean) { this._showbar.set(state); }
  setFooter(state: boolean) { this._showfooter.set(state) }

  // ✅ 단순히 상태와 가로폭만 매칭
  setLeft(state: boolean) {
    this._showleft.set(state);
    this._sidebarWidth.set(state ? this.defaultSidebarSize() : 0);
  }

  setRouteLeft(state: boolean) {
    this._routeShowLeft.set(state);
  }
  setSidebarSize(size: number) {
    this._sidebarWidth.set(size);
  }

  // ✅ 토글할 때 "데스크톱 사용자의 의도"만 스토리지에 박아넣음!
  toggleLeft() {
    // 만약 모바일이면 토글 시 단순히 열고 닫기만 제어하고 사용자의 영구 의도로 보지 않음
    if (this.isMobile()) {
      this.setLeft(!this._showleft());
    } else {
      const nextClosed = !this._userClosedLeft();
      this._userClosedLeft.set(nextClosed);
      localStorage.setItem(this.STORAGE_LEFT_KEY, String(nextClosed));
    }
  }

  // 4. 헬퍼 메서드 : 스토리지 값 읽어 오기
  private getInitialClosedSate(): boolean {
    const saved = localStorage.getItem(this.STORAGE_LEFT_KEY);
    return saved === 'true';
  }
}
