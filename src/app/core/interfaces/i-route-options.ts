import { LayoutType, ThemeType } from "@app/core/outlet-data/outlet-data.model";
import { Roles } from "@app/shared/constants/roles.contants";

export interface IRouteOptions {
  layout?: LayoutType;
  theme?: ThemeType;
  animation?: 'default' | 'slide' | 'zoom' | 'fade' | 'none';
  disabled?: boolean;
  disabledOverrides?: {
    mandala?: boolean;
    samsara?: boolean;
    karma?: boolean;
    vipassana?: boolean;
  };
  // ── OutletData 레이아웃 제어 ─────────────
  showLeft?: boolean;    // ✅ 사이드바 (기본 true)
  showHeader?: boolean;  // ✅ 헤더 (기본 true)
  showFooter?: boolean;  // ✅ 푸터 (기본 true)
  showFooterOverrides?: { // 라우트별 개별 오버라이
    mandala?: boolean;
    samsara?: boolean;
    karma?: boolean;
    vipassana?: boolean;
  };
  icon?: string;

  // ── 전체 showBar 기본값 ──────────────────
  showBar?: boolean; // 전체 기본값
  showBarOverrides?: { // 라우트별 개별 오버라이
    mandala?: boolean;
    samsara?: boolean;
    karma?: boolean;
    vipassana?: boolean;
  };

  // ── 역할 오버라이드 ──────────────────────
  roleOverrides?: {
    mandala?: RoleList;
    samsara?: RoleList;
    karma?: RoleList;
    vipassana?: RoleList;
  }
  defaultPath?: RouteKey
}

export type RoleList = typeof Roles[keyof typeof Roles];

export type RouteKey = 'mandala' | 'samsara' | 'karma' | 'vipassana';