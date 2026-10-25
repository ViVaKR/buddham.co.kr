import { Routes } from '@angular/router';
import { Paths } from '@app/data/menu-data';

export const authRoutes: Routes = [
  {
    path: Paths.SignUp.url,
    loadChildren: () => import('@pages/sign-up/sign-up.routes'),
  },
  {
    path: Paths.SignIn.url,
    loadChildren: () => import('@pages/sign-in/sign-in.routes'),
  },
  {
    path: Paths.SignOut.url,
    loadChildren: () => import('@pages/sign-out/sign-out.routes'),
  },
  {
    path: Paths.Account.url,
    loadChildren: () => import('@pages/account/account.routes'),
  },
  // * 회원정보 수정 (본인, 관리자)
  {
    path: `${Paths.AccountVipassana.url}/:id`,
    loadComponent: () => import('@pages/account/account-karma/account-karma')
  },
  {
    path: Paths.SecuritySettings.url,
    loadChildren: () => import('@pages/security-settings/security-settings.routes'),
  },
  {
    path: Paths.TwoFactor.url,
    loadChildren: () => import('@pages/two-factor/two-factor.routes'),
  },
  {
    path: Paths.TwoFactorVerify.url,
    loadChildren: () => import('@pages/two-factor-verify/two-factor-verify.routes'),
  },
  {
    path: Paths.ForgotPassword.url,
    loadChildren: () => import('@pages/forgot-password/forgot-password.routes'),
  },
  {
    path: Paths.ResetPassword.url,
    loadChildren: () => import('@pages/reset-password/reset-password.routes'),
  },
  {
    path: Paths.VerifyEmail.url,
    loadChildren: () => import('@pages/verify-email/verify-email.routes'),
  },
  {
    path: Paths.ConfirmEmail.url,
    loadChildren: () => import('@pages/confirm-email/confirm-email.routes'),
  },
  {
    path: Paths.UserInfo.url,
    loadChildren: () => import('@pages/user-info/user-info.routes'),
    data: {
      roles: ['Admin']
    }
  },
  {
    path: Paths.Auth.url,
    data: {
      Roles: ['Admin', 'User']
    },
    loadChildren: () => import('@pages/auth/auth.routes')
  },
] as Routes;
