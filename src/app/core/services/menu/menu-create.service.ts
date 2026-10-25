import { Injectable } from '@angular/core';
import { IMenuItem } from '@app/core/interfaces/i-menu-config';
import { getTitle, NavKey, NavKeyType, Paths } from '@app/data/menu-data';
import { Icons } from '@app/shared/constants/icon.constants';

type RoleOverrides = Partial<Record<NavKeyType, string[]>>;

@Injectable({ providedIn: 'root' })
export class MenuCreateService {

  createGroupsByKeys(
    keys: string[],
    roleOverrides: RoleOverrides = {},
  ): IMenuItem[] {
    return keys
      .map(key => (Paths as Record<string, any>)[key])
      .filter(p => !!p?.url)
      .map((p, index) => ({
        ...p,
        id: index,
        expanded: index === 0,
        children: () => this.getDefaultMenuItems(p, roleOverrides)
      } as IMenuItem));
  }

  creteRootMenu(rootGroups: IMenuItem[]): IMenuItem[] {
    return rootGroups.map((menu, index) => {
      return {
        ...menu,
        id: index,
        icon: menu.icon || Icons.NaturePeople
      }
    });
  }

  // 공통 badge 빌더
  private buildBadge(items: IMenuItem) {
    return {
      show: () => !!items.badge?.show(),
      text: () => items.badge?.text?.() ?? '',
    };
  }

  // ✅ Paths/NavKey 중앙에서 관리되니 서비스 수정 불필요
  getDefaultMenuItems(
    items: IMenuItem,
    roleOverrides: any = {},
  ): IMenuItem[] {

    const badge = this.buildBadge(items);
    const defs = [
      { id: 0, title: getTitle(NavKey.Mandala), path: NavKey.Mandala, exact: false, key: NavKey.Mandala },
      { id: 1, title: getTitle(NavKey.Samsara), path: NavKey.Samsara, exact: true, key: NavKey.Samsara },
      { id: 2, title: getTitle(NavKey.Karma), path: NavKey.Karma, exact: true, key: NavKey.Karma },
      { id: 3, title: getTitle(NavKey.Vipassana), path: NavKey.Vipassana, exact: true, key: NavKey.Vipassana },
    ];

    return defs.map(d => {
      const roles = roleOverrides[d.key];
      return {
        id: d.id,
        title: d.title,
        en: d.key,
        url: `/${items.url}/${d.path}`,
        icon: Icons.NaturePeople,
        exact: d.exact,
        badge,
        access: !roles || roles.length === 0
          ? undefined
          : { requiresAuth: true, roles: [...roles] }
      };
    });
  }
}
