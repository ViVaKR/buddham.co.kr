import { OutletData } from '@app/core/outlet-data/outlet-data.model';
import { getTitle, Paths } from '@app/data/menu-data';
import { buildStandardRoutes } from '@app/pages/route.factor';
import { Icons } from '@app/shared/constants/icon.constants';
import { Role, Roles } from '@app/shared/constants/roles.contants';

export default buildStandardRoutes(
  /** 1. 기본 라우트 경로 */
  [Paths.Account.url], // 1

  /** 2. 제목 */
  getTitle, // 2

  /** 3-1. 메뉴그룹, IMenuItem[] */
  () => [
    {
      id: 'security',
      title: '인가(印可)',
      icon: Icons.NaturePeople,
      children: () => [
        { id: 0, ...Paths.SecuritySettings, access: { requiresAuth: true } },
        {
          id: 1,
          ...Paths.VerifyEmailKarma,
          access: {
            requiresAuth: true,
            hideWhen: {
              emailConfirmed: true,
            },
          },
        },
        { id: 2, ...Paths.ChangePassword, access: { requiresAuth: true } },
      ],
    },
    {
      id: 'roles',
      title: '계위(階位)',
      icon: Icons.NaturePeople,
      access: {
        roles: ['Admin']
      },
      children: () => [
        {
          id: 1,
          ...Paths.AccountRole,
          access: {
            requiresAuth: true,
            roles: ['Admin']
          },
        },
        {
          id: 2,
          ...Paths.AccountRoleKarma,
          access: {
            requiresAuth: true,
            roles: ['Admin']
          },
        },
      ],
    },
    {
      id: 'nirvana',
      title: '피안(彼岸)',
      icon: Icons.NaturePeople,
      children: () => [{ id: 0, ...Paths.Nirvana, access: { requiresAuth: true } }],
    },
  ],

  /** 3-2 각 메뉴그룹(3-1)별 라우트(Route) 배열, Routes */
  [
    {
      path: Paths.Nirvana.url,
      loadComponent: () => import('@pages/nirvana/nirvana/nirvana'),
      data: {
        showBar: true,
        menuGroupKeys: [Paths.Account.url],
        Roles: [Role.User],
        outletData: {
          layout: 'default',
          title: Paths.Nirvana.title,
        } satisfies OutletData,
      },
    },
    {
      path: Paths.AccountRole.url,
      loadComponent: () => import('@pages/account-role/account-role/account-role'),
      data: {
        showBar: true,
        menuGroupKeys: [Paths.Account.url],
        Roles: [Role.User],
        outletData: {
          showFooter: false,
          layout: 'default',
          title: Paths.AccountRole.title,
        } satisfies OutletData,
      },
    },
    {
      path: `${Paths.AccountRoleKarma.url}`,
      loadComponent: () => import('@pages/account-role/account-role-karma/account-role-karma'),
      data: {
        showBar: true,
        menuGroupKeys: [Paths.Account.url],
        Roles: [Role.User],
        outletData: {
          showFooter: false,
          layout: 'default',
          title: '역할 등록',
        } satisfies OutletData,
      },
    },
    {
      path: `${Paths.AccountRoleKarma.url}/:id`,
      loadComponent: () => import('@pages/account-role/account-role-karma/account-role-karma'),
      data: {
        showBar: true,
        menuGroupKeys: [Paths.Account.url],
        Roles: [Role.User],
        outletData: {
          showFooter: false,
          layout: 'default',
          title: '수정',
        } satisfies OutletData,
      },
    },
    // 인가
    {
      path: Paths.SecuritySettings.url,
      loadComponent: () => import('@pages/security-settings/security-settings-mandala/security-settings-mandala'),
      data: {
        showBar: true,
        menuGroupKeys: [Paths.Account.url],
        Roles: [Role.User],
        outletData: {
          showFooter: false,
          layout: 'default',
          title: Paths.TwoFactor.title,
        } satisfies OutletData,
      },
    },
    // * 2FA *
    {
      path: Paths.TwoFactor.url,
      loadComponent: () => import('@pages/two-factor/two-factor-karma/two-factor-karma'),
      data: {
        showBar: true,
        menuGroupKeys: [Paths.Account.url],
        Roles: [Role.User],
        outletData: {
          showFooter: false,
          layout: 'default',
          title: Paths.TwoFactor.title,
        } satisfies OutletData,
      },
    },
    // * 이메일 인증 *
    {
      path: Paths.VerifyEmailKarma.url,
      loadComponent: () => import('@pages/verify-email/verify-email-karma/verify-email-karma'),
      data: {
        showBar: true,
        menuGroupKeys: [Paths.Account.url],
        Roles: [Role.User],

        outletData: {
          layout: 'default',
          title: Paths.ConfirmEmail.title,
        } satisfies OutletData,
      },
    },
    {
      path: Paths.ChangePassword.url,
      loadComponent: () => import('@pages/change-password/change-password/change-password'),
      data: {
        showBar: true,
        menuGroupKeys: [Paths.Account.url],
        Roles: [Role.User],
        outletData: {
          layout: 'default',
          title: Paths.ChangePassword.title,
        } satisfies OutletData,
      },
    },
  ],

  /** 4. Account - 라우트 옵션 (route-outlet), IRouteOptions */
  {
    defaultPath: 'mandala',
    showHeader: true,
    showLeft: true,
    showBar: true,
    showFooter: false,
    roleOverrides: {
      mandala: Roles.User,
      samsara: Roles.Admin,
      karma: Roles.User,
      vipassana: Roles.User,
    },
    disabledOverrides: {
      mandala: false,
      samsara: false,
      karma: true,
      vipassana: true,
    },
  },
);
