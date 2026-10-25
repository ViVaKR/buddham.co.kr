import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserStore } from '@services/auth/user.store';
import { Paths } from '@data/menu-data';

export const emailConfirmedGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userStore = inject(UserStore);

  if (!userStore.isEmailConfirmed()) {
    return router.createUrlTree([Paths.VerifyEmail.url], {
      queryParams: { returnUrl: state.url },
    });
  }
  return true;
};
