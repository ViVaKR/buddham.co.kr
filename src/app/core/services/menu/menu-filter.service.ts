import { inject, Service } from '@angular/core';
import { IUserRoleRequest } from '@app/core/interfaces/api/request/i-user-role.request';
import { IMenuItem } from '@app/core/interfaces/i-menu-config';
import { AuthStore } from '@app/core/services/auth/auth.store';
import { UserStore } from '@app/core/services/auth/user.store';

/** 필터 판단에 필요한 컨텍스트 */
interface FilterContext {
  isLoggedIn: boolean;
  emailConfirmed: boolean;
  userRoles: IUserRoleRequest[];
}

@Service()
export class MenuFilterService {
  protected readonly authStore = inject(AuthStore);
  protected readonly userStore = inject(UserStore);

  // ─────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────

  /** 그룹 배열 필터링 — 그룹 자체 access + children 재귀 필터 */
  filterGroups(groups: IMenuItem[]): IMenuItem[] {
    if (!groups?.length) return [];
    const ctx = this.buildContext();
    return groups
      .filter((group) => this.isVisible(group, ctx)) // ✅ 그룹 자체도 필터
      .map((group) => ({
        ...group,
        disabled: this.isDisabled(group, ctx), // ✅ disabled 반영
        children: group.children
          ? () => this.filterMenus(group.children!(), ctx) // ctx 재사용
          : undefined,
      }));
  }

  /** 메뉴 배열 필터링 */
  filterMenus(menus?: IMenuItem[], ctx?: FilterContext): IMenuItem[] {
    if (!menus?.length) return [];
    const c = ctx ?? this.buildContext(); // ctx 재사용으로 성능↑
    return menus
      .filter((menu) => this.isVisible(menu, c))
      .map((menu) => ({
        ...menu,
        url: this.resolveUrl(menu), // ✅ param 조합
        disabled: this.isDisabled(menu, c), // ✅ disabled 반영
        children: menu.children
          ? () => this.filterMenus(menu.children!(), c) // ✅ 재귀
          : undefined,
      }));
  }

  // ─────────────────────────────────────────────
  // Core Logic
  // ─────────────────────────────────────────────

  /**
   * 메뉴 표시 여부 판단
   * access가 없으면 → 무조건 표시 (Public)
   * access가 있으면 → 모든 조건 통과해야 표시
   */
  private isVisible(menu: IMenuItem, ctx: FilterContext): boolean {
    const a = menu.access;
    if (!a) return true; // access 없으면 Public

    return (
      this.checkRequiresAuth(a, ctx) &&
      this.checkRequiresEmailConfirmed(a, ctx) &&
      this.checkRoles(a, ctx) &&
      this.checkHideWhen(a, ctx)
    );
  }

  /**
   * disabled 여부 판단
   * - IMenuItem.disabled가 명시적으로 true인 경우
   * - access.roles 조건은 맞지만 권한 부족 → 숨김 대신 비활성화 옵션
   *   (현재는 단순히 disabled 필드만 반영)
   */
  private isDisabled(menu: IMenuItem, _ctx: FilterContext): boolean {
    return menu.disabled === true;
  }

  // ─────────────────────────────────────────────
  // 개별 조건 체커
  // ─────────────────────────────────────────────

  /** 로그인 여부 */
  private checkRequiresAuth(a: NonNullable<IMenuItem['access']>, ctx: FilterContext): boolean {
    // if (a.requiresAuth === undefined) return true; // 설정 없으면 통과
    // return a.requiresAuth === ctx.isLoggedIn;
    // 의도가 "로그인 필요" 라면:
    if (a.requiresAuth === true) return ctx.isLoggedIn;
    if (a.requiresAuth === false) return !ctx.isLoggedIn; // 비로그인 전용 메뉴
    return true;
  }

  /** 이메일 인증 여부 */
  private checkRequiresEmailConfirmed(a: NonNullable<IMenuItem['access']>, ctx: FilterContext): boolean {
    if (!a.requiresEmailConfirmed) return true;
    return ctx.emailConfirmed;
  }

  /**
   * 역할 체크 — roleMatchMode 완전 지원
   * - 'any' (기본): roles 중 하나라도 일치하면 OK
   * - 'all'       : roles 전부 일치해야 OK
   */
  private checkRoles(a: NonNullable<IMenuItem['access']>, ctx: FilterContext): boolean {
    if (!a.roles?.length) return true; // 역할 조건 없으면 통과

    const mode = a.roleMatchMode ?? 'any';
    const userRoleNames = ctx.userRoles.map((r) => r.en);

    return mode === 'all'
      ? a.roles.every((role) => userRoleNames.includes(role)) // ✅ 'all'
      : a.roles.some((role) => userRoleNames.includes(role)); // ✅ 'any'
  }

  /**
   * hideWhen — 조건에 해당하면 숨김
   * emailConfirmed: true → 이메일 인증 완료 시 숨김 (인증 유도 메뉴 등)
   * roles          → 해당 역할 보유 시 숨김
   */
  private checkHideWhen(a: NonNullable<IMenuItem['access']>, ctx: FilterContext): boolean {
    const hw = a.hideWhen;
    if (!hw) return true;

    // 이메일 인증 상태로 숨김
    if (hw.emailConfirmed !== undefined && hw.emailConfirmed === ctx.emailConfirmed) {
      return false;
    }

    // 역할로 숨김 (hideWhen.roles는 항상 'any' 방식)
    if (hw.roles?.length) {
      const userRoleNames = ctx.userRoles.map((r) => r.en);
      const matched = hw.roles.some((role) => userRoleNames.includes(role));
      if (matched) return false;
    }

    return true;
  }

  // ─────────────────────────────────────────────
  // 유틸
  // ─────────────────────────────────────────────

  /** param이 있으면 URL 끝에 조합 */
  private resolveUrl(menu: IMenuItem): string | undefined {
    if (!menu.url) return undefined;
    if (!menu.param) return menu.url;
    return `${menu.url}/${menu.param}`;
  }

  /** 현재 인증 컨텍스트 빌드 */
  private buildContext(): FilterContext {
    const currentUser = this.userStore.user();
    return {
      isLoggedIn: this.authStore.isLoggedIn(),
      emailConfirmed: this.userStore.isEmailConfirmed(),
      userRoles: currentUser?.roles ?? [],
    };
  }
}
