import { Routes } from '@angular/router';
import { routeAccessGuard } from '@app/core/guards/route-access-guard';
import { IMenuItem } from '@app/core/interfaces/i-menu-config';
import { IRouteOptions, RoleList, RouteKey } from '@app/core/interfaces/i-route-options';
import { OutletData } from '@app/core/outlet-data/outlet-data.model';
import { NavKey, NavKeyType } from '@app/data/menu-data';
import { Icons } from '@app/shared/constants/icon.constants';
import { Roles } from '@app/shared/constants/roles.contants';
import { toKebabCase } from '@app/shared/constants/utility.contants';

export const buildStandardRoutes = (

  /** 1. 기본 라우트 경로 */
  baseNames: string | string[],

  /** 2. 제목 */
  getTitle: (key: NavKeyType) => string,

  /** 3-1. 메뉴그룹, IMenuItem[] */
  extraGroups?: () => IMenuItem[],

  /** 3-2 각 메뉴그룹(3-1)별 라우트(Route) 배열, Routes */
  extraChildren?: Routes,

  /** 4. 라우트 옵션 (route-outlet), IRouteOptions */
  options?: IRouteOptions,

): Routes => {

  const Lc = (path: string) => () => import(`./${primary}/${path}/${path}.ts`);
  const names = Array.isArray(baseNames) ? baseNames : [baseNames];
  const primary = toKebabCase(names[0]);
  const { roleOverrides = {} } = options ?? {};
  const { disabledOverrides = {} } = options ?? {};
  const sharedData = { menuGroupKeys: names, extraGroups, roleOverrides, disabledOverrides };

  const {
    layout = 'default',
    theme = 'light',
    animation = 'fade',
    icon = Icons.NaturePeople,
    showBar = true,
    showBarOverrides = {},
    showLeft = true,
    showHeader = true,
    showFooter = true,
    showFooterOverrides = {},
    defaultPath = NavKey.Mandala,
  } = options ?? {};

  const resolveShowBar = (routeName: RouteKey): boolean => showBarOverrides[routeName] ?? showBar;

  const resolveShowFooter = (showFooterName: RouteKey): boolean => showFooterOverrides[showFooterName] ?? showFooter;

  const resolveRoles = (key: keyof typeof roleOverrides): RoleList => roleOverrides[key] ?? Roles.Public;

  const makeOutletData = (title: string, routeName?: RouteKey): OutletData => ({
    layout,
    theme,
    animation,
    title,
    icon,
    showLeft,
    showHeader,
    showFooter: routeName ? resolveShowFooter(routeName) : showFooter,
  });

  const data = (
    /** 제목 */
    title: string,

    /** 권한 명 */
    roles: RoleList = Roles.Public,

    /** 라우트 이름  */
    routeName: RouteKey,
  ) => ({
    ...sharedData,
    showBar: resolveShowBar(routeName),
    breadcrumb: title,
    breadcrumIcon: Icons.AutoStories,
    reuse: false,
    roles: [...roles],
    outletData: makeOutletData(title, routeName),
  });

  return [
    {
      path: '',
      loadComponent: Lc(primary),
      canActivateChild: [routeAccessGuard],
      data: {
        ...sharedData,
        outletData: makeOutletData(primary),
      },
      children: [
        { path: '', redirectTo: defaultPath, pathMatch: 'full' },
        {
          path: NavKey.Mandala,
          loadComponent: Lc(`${primary}-${NavKey.Mandala}`),
          data: data(getTitle(NavKey.Mandala), resolveRoles(NavKey.Mandala), NavKey.Mandala),
        },
        {
          path: NavKey.Samsara,
          loadComponent: Lc(`${primary}-${NavKey.Samsara}`),
          data: data(getTitle(NavKey.Samsara), resolveRoles(NavKey.Samsara), NavKey.Samsara),
        },
        {
          path: NavKey.Karma,
          loadComponent: Lc(`${primary}-${NavKey.Karma}`),
          data: data(getTitle(NavKey.Karma), resolveRoles(NavKey.Karma), NavKey.Karma),
        },
        {
          path: `${NavKey.Karma}/:id`,
          loadComponent: Lc(`${primary}-${NavKey.Karma}`),
          data: data(getTitle(NavKey.Edit), resolveRoles(NavKey.Karma), NavKey.Karma),
        },
        {
          path: `${NavKey.Vipassana}/:id`,
          loadComponent: Lc(`${primary}-${NavKey.Vipassana}`),
          data: data(getTitle(NavKey.Vipassana), resolveRoles(NavKey.Vipassana), NavKey.Vipassana),
        },

        ...(extraChildren ?? []).map((route) => ({
          ...route,
          data: { ...sharedData, ...(route.data ?? {}) },
        })),

        { path: '**', redirectTo: defaultPath },
      ],
    },
  ] as Routes;
};

/**
 * 🪷 buddham.co.kr 표준 라우트 팩토리
 *
 * 구조:
 *   1. UX 메뉴  → IMenuItem.access (표시/숨김)
 *   2. 라우트   → routeAccessGuard (실제 차단)
 *   3. 페이지   → buildStandardRoutes (구조 생성)
 *
 * 자동 생성: scripts/create-domain.sh [도메인명]
 *
 *
🪷 뜻을 담은 영문 불교 네이밍

    ['mandala', '법계 · 法界 · 만다라 · Mandala'], - Home
    ['samsara', '법보 · 法寶 · 목록 · Samsara'], - List
    ['karma', '사경 · 寫經 · 작성 · Karma'], - Create Form
    ['edit', '정진 · 精進 · 수정 · Karma'], - Update Form
    ['vipassana', '관조 · 觀照 · 읽기 · Vipassana'] - Detail

 */

/** 표준 라우트 및 사용자 경험(UX) 표준설정 */
