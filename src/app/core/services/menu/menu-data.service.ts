import { computed, inject, Injectable } from '@angular/core';
import { IMenuItem } from '@app/core/interfaces/i-menu-config';
import { SignOutService } from '@app/core/services/auth/sign-out.service';
import { MenuCreateService } from '@app/core/services/menu/menu-create.service';
import { MenuFilterService } from '@app/core/services/menu/menu-filter.service';
import { NavKeyType, Paths } from '@app/data/menu-data';
import { Icons } from '@app/shared/constants/icon.constants';
import { RoleList } from '@interfaces/i-route-options';

export const flattenMenus = (groups: IMenuItem[], withParentUrl = false): IMenuItem[] =>
  groups.flatMap((group) =>
    (group.children?.() ?? []).map((menu) => ({
      ...menu,
      url: withParentUrl ? [group.url, menu.url].filter(Boolean).join('/') : menu.url,
    })),
  );

@Injectable({ providedIn: 'root' })
export class MenuDataService extends MenuFilterService {
  private create = inject(MenuCreateService);

  private readonly logoutService = inject(SignOutService);

  // 메뉴 바
  /*
    [ 삼장 (Pitaka) ] → 부처님의 가르침과 계율, 철학을 담은 세 가지 지식의 그릇
     [ 성전 (Canon) ] → 시대를 관통하여 공인된 불교 최고의 기준이자 정통 성전
      [ 경전 (Sutra) ] → 초기 아함·숫타니파타부터 대승 성전까지 실로 꿰어낸 붓다의 정갈한 가르침
       [ 법 (Dhamma) ] → 우주와 삶이 작동하는 있는 그대로의 생생한 진리와 법칙
        [ 사경 (Lekhana) ] → 손끝으로 한 자 한 자\n부처님의 마음을 새기는 수행 마당
         [ 법담 (Dhamma Chat) ] → AI 법우 및 도반들과 함께 진리를\n묻고 답하는 지혜의 대화장
  */
  private readonly rootGroups: IMenuItem[] = [
    Paths.Dhamma,     // 법
    Paths.Canon,      // 성전
    Paths.Pitaka,     // 삼장
    Paths.Sutra,      // 경전
    Paths.Lekhana,    // 사경
    Paths.DhammaChat, // 법담
    Paths.Chat,
    Paths.Guide,
  ];

  // 로그인 전
  private readonly authGroups: IMenuItem[] = [Paths.SignIn, Paths.SignUp, Paths.ForgotPassword];

  // 로그인 후
  private readonly accountGroups: IMenuItem[] = [
    Paths.Account,
    Paths.UserInfo,
  ];

  // * 메인메뉴
  readonly navGroup = computed<IMenuItem[]>(() => this.filterGroups(this.create.creteRootMenu(this.rootGroups)));
  readonly authGroup = computed<IMenuItem[]>(() => this.filterGroups(this.create.creteRootMenu(this.authGroups)));

  // 로그인 후 풀다운 메뉴
  readonly accountGroup = computed<IMenuItem[]>(() => [
    ...this.filterGroups(this.create.creteRootMenu(this.accountGroups)),
    this.signOutItem,
  ]);

  /** 1-3  */
  createGroupsByKeys(keys: string[], roleOverrides: Record<string, RoleList> = {}): IMenuItem[] {
    return this.create.createGroupsByKeys(keys, roleOverrides);
  }

  private readonly signOutItem: IMenuItem = {
    id: 101,
    title: Paths.SignOut.title,
    ko: '로그아웃',
    en: 'SignOut',
    url: Paths.SignOut.url,
    navKey: '' as NavKeyType,
    icon: Icons.Logout,
    action: () => this.logoutService.signOut(),
    access: { requiresAuth: true },
  };
}
