import { NavKeyType } from "@app/data/menu-data";

export type AccessType = {

  // ─────────────────────────────────────────
  // 🔒 접근 제어 (실제 차단은 routeAccessGuard 가 담당)
  // ─────────────────────────────────────────
  disabled?: boolean;
  requiresAuth?: boolean;
  requiresEmailConfirmed?: boolean;
  roles?: string[];
  roleMatchMode?: 'any' | 'all'; // ✅ filterMenus에서 실제 처리됨

  // ─────────────────────────────────────────
  // 👁 UX 표시 제어 (메뉴에서만 숨김, 차단 아님)
  // ─────────────────────────────────────────
  hideWhen?: {
    emailConfirmed?: boolean;
    roles?: string[]; // ✅ hideWhen.roles도 처리됨
  };
}

export interface IMenuItem {
  id?: number | string;
  title: string;
  ko?: string;
  hj?: string;
  en?: string;
  sa?: string; // 산스크리트 (梵語)
  pi?: string; // 팔리어 (巴利語)
  akasha?: string; // 아카샤 (우주, 안드로메다 포함 전 우주 모든 생물 무생물체 대상)
  url?: string;
  icon?: string;
  color?: string;
  exact?: boolean;
  isDivider?: boolean;
  navKey?: NavKeyType;
  param?: string | null;
  tooltip?: string;
  disabled?: boolean;
  disabledOverride?: {};
  action?: (param?: any) => void;
  badge?: { show: () => boolean; text: () => string; };
  expanded?: boolean;
  access?: AccessType;
  children?: () => IMenuItem[];
}
