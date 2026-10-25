import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { UserStore } from '@app/core/services/auth/user.store';
import { Paths } from '@app/data/menu-data';
import { catchError, filter, map, of, take, timeout } from 'rxjs';

export const loadingGuard: CanActivateFn = (route, state) => {

  const userStore = inject(UserStore);
  const router = inject(Router);

  return toObservable(userStore.isInitialized).pipe(
    filter(initialized => {
      return initialized === true;
    }),
    take(1),
    timeout(1_000),
    map(() => {
      return true;
    }),
    catchError(() => {
      return of(router.createUrlTree([Paths.Error.url], {
        queryParams: { reason: 'initialization_timeout' }
      }));
    })
  )
};
