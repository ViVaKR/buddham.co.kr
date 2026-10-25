// route-access.guard.ts
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, CanActivateChildFn, Router, RouterStateSnapshot } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthStore } from '@app/core/services/auth/auth.store';
import { UserStore } from '@app/core/services/auth/user.store';
import { AuthService } from '@app/core/services/auth/auth.service';
import { TokenStorage } from '@app/core/services/auth/token.storage';
import { Paths } from '@app/data/menu-data';
import { catchError, filter, map, Observable, of, switchMap, take, timeout } from 'rxjs';

export const routeAccessGuard: CanActivateFn & CanActivateChildFn =
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

    const router = inject(Router);
    const authStore = inject(AuthStore);
    const userStore = inject(UserStore);
    const authService = inject(AuthService);
    const tokenStorage = inject(TokenStorage);

    // ─────────────────────────────────────────
    // STEP 1. 앱 초기화 완료 대기 (구 loadingGuard)
    // ─────────────────────────────────────────
    return toObservable(userStore.isInitialized).pipe(
      filter(initialized => initialized === true),
      take(1),
      timeout({
        each: 3_000, // ✅ 구버전 1초 → 3초로 여유있게
        with: () => of(router.createUrlTree([Paths.Error.url], {
          queryParams: { reason: 'initialization_timeout' }
        }))
      }),

      // ─────────────────────────────────────────
      // STEP 2. 라우트 data 읽기
      // ─────────────────────────────────────────
      switchMap(() => {
        const roles: string[] = route.data['roles'] ?? [];
        const requiresAuth: boolean = route.data['requiresAuth'] ?? (roles.length > 0);
        const requiresEmailConfirmed = route.data['requiresEmailConfirmed'] as boolean | undefined;

        // ── Public 라우트 → 즉시 통과 ──────────
        if (!requiresAuth && roles.length === 0) {
          return of(true as const);
        }

        // ─────────────────────────────────────────
        // STEP 3. 토큰 체크 (구 authGuard)
        // ─────────────────────────────────────────
        const token = tokenStorage.getAccessToken();
        if (!token) {
          return of(router.createUrlTree([Paths.SignIn.url], {
            queryParams: { returnUrl: state.url }
          }));
        }

        // ─────────────────────────────────────────
        // STEP 4. 유저 정보 없으면 재로드 (구 authGuard reloadUserInfo)
        // ─────────────────────────────────────────

        if (!userStore.currentUser()) {
          return reloadUser(authService, authStore, userStore, tokenStorage, router, state).pipe(
            switchMap(ok => {
              if (ok !== true) return of(ok); // 실패 → 리다이렉트
              return checkPermissions(state, router, userStore, roles, requiresEmailConfirmed);
            })
          );
        }

        // ─────────────────────────────────────────
        // STEP 5. 권한 체크
        // ─────────────────────────────────────────
        return checkPermissions(state, router, userStore, roles, requiresEmailConfirmed);
      })
    );
  };

// ─────────────────────────────────────────────────────
// 유저 정보 재로드 (토큰은 있는데 userStore 비어있는 경우)
// ─────────────────────────────────────────────────────
function reloadUser(
  authService: AuthService,
  authStore: AuthStore,
  userStore: UserStore,
  tokenStorage: TokenStorage,
  router: Router,
  state: RouterStateSnapshot
): Observable<true | ReturnType<Router['createUrlTree']>> {

  return authService.loadCurrentUser().pipe(
    take(1),
    map(user => {
      if (!user) throw new Error('no user');
      authStore.setLogin(user);
      userStore.setUser(user);
      return true as const;
    }),
    catchError(() => {
      tokenStorage.clear();
      authStore.clear();
      userStore.clear();
      return of(router.createUrlTree([Paths.SignIn.url], {
        queryParams: { returnUrl: state.url }
      }));
    })
  );
}

// ─────────────────────────────────────────────────────
// 권한 체크 — 이메일 인증 + 역할
// ─────────────────────────────────────────────────────
function checkPermissions(
  state: RouterStateSnapshot,
  router: Router,
  userStore: UserStore,
  roles: string[],
  requiresEmailConfirmed?: boolean
): Observable<true | ReturnType<Router['createUrlTree']>> {

  // ── 이메일 인증 체크 (구 emailConfirmedGuard) ──
  if (requiresEmailConfirmed && !userStore.isEmailConfirmed()) {
    // return of(router.createUrlTree([Paths.ConfirmEmail.url], { queryParams: { returnUrl: state.url } }));
  }

  // ── 역할 체크 (구 roleGuard) ──
  if (roles.length > 0) {
    const hasRole = userStore.hasAnyRole(roles);
    if (!hasRole) {
      return of(router.createUrlTree([Paths.Home.url]));
    }
  }

  return of(true as const);
}