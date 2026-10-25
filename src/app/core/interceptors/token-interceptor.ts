import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SignOutService } from '@app/core/services/auth/sign-out.service';
import { TokenService } from '@app/core/services/auth/token.service';
import { TokenStorage } from '@app/core/services/auth/token.storage';
import { BehaviorSubject, catchError, filter, finalize, switchMap, take, throwError, timeout } from 'rxjs';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {

  const signOutService = inject(SignOutService);
  const tokenService = inject(TokenService);
  const tokenStorage = inject(TokenStorage);

  const accessToken = tokenStorage.getAccessToken();
  const isRefresh = req.url.includes('/Auth/RefreshToken');

  let clonedReq = req;

  if (accessToken && !isRefresh) {
    const cleanToken = accessToken.trim().replace(/[\r\n]/g, "");
    clonedReq = req.clone({ setHeaders: { Authorization: `Bearer ${cleanToken}` } });
  }

  return next(clonedReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isRefresh) {

        if (isRefreshing) {
          return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            timeout(10_000),
            switchMap(token => {
              const cleanToken = token!.trim().replace(/[\r\n]/g, "");
              return next(clonedReq.clone({ setHeaders: { Authorization: `Bearer ${cleanToken}` } }));
            })
          );
        }

        isRefreshing = true;
        refreshTokenSubject.next(null);

        return tokenService.refreshToken().pipe(
          switchMap(res => {
            if (!res?.isSuccess || !res.content?.token) {
              throw new Error('토큰갱신 실패');
            }

            const newToken = res.content?.token ?? '';
            refreshTokenSubject.next(newToken);

            // ✨ 3번째 수정: 갱신 성공 직후 재요청 시에도 cleanToken 적용
            const cleanToken = newToken.trim().replace(/[\r\n]/g, "");
            return next(
              clonedReq.clone({
                setHeaders: { Authorization: `Bearer ${cleanToken}` }
              })
            );
          }),
          catchError(err => {
            refreshTokenSubject.error(err);
            refreshTokenSubject = new BehaviorSubject<string | null>(null);
            signOutService.clearAll();
            return throwError(() => err);
          }),
          finalize(() => {
            isRefreshing = false;
          })
        );
      }
      return throwError(() => err);
    })
  );
};
