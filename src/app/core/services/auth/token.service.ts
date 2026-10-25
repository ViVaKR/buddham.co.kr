import { inject, Service } from '@angular/core';
import { IDataResponse } from '@app/core/interfaces/api/i-response';
import { IRefreshTokenRequest } from '@app/core/interfaces/api/request/i-refresh-token.request';
import { TokenStorage } from '@app/core/services/auth/token.storage';
import { BaseService } from '@app/core/services/base/base.service';
import { catchError, defaultIfEmpty, EMPTY, finalize, Observable, of, Subject, switchMap, take, tap } from 'rxjs';

@Service()
export class TokenService extends BaseService {

  private readonly tokenStorage = inject(TokenStorage);

  // 🌟 동시에 여러 곳(인터셉터, SSE 등)에서 ensureFreshToken()을 호출해도
  //    refresh 요청은 단 한 번만 나가도록 막아주는 게이트
  private refreshing = false;
  private refreshed$ = new Subject<string>();

  /**
     * 항상 "신선한" access token을 보장해서 반환.
     * - 살아있으면 즉시 반환
     * - 만료됐으면 refresh 진행 (이미 진행 중이면 그 결과에 합류 — 중복 호출 방지)
     *
     * 인터셉터와 SSE 등 토큰이 필요한 모든 곳이 이 메서드 하나만 의지하면
     * race condition과 중복 refresh 문제가 한 번에 해결됨.
     */
  ensureFreshToken(): Observable<string> {
    const current = this.tokenStorage.getAccessToken();
    if (current && !this.tokenStorage.isAccessTokenExpired()) {
      return of(current);
    }

    // 이미 누군가 refresh 진행 중이면 그 결과를 같이 기다림
    if (this.refreshing) {
      return this.refreshed$.pipe(take(1));
    }

    this.refreshing = true;

    return this.refreshToken().pipe(
      switchMap((res) => {
        if (res?.isSuccess && res.content?.token) {
          return of(res.content.token);
        }
        throw new Error('세션 만료: 다시 로그인해 주세요.');
      }),
      // 🌟 refreshToken()이 토큰 부재로 EMPTY를 반환하는 경우(조용히 complete)
      //    switchMap 콜백이 한 번도 안 불리고 끝나버리므로, 여기서 명시적으로 에러 처리
      defaultIfEmpty(null as unknown as string),
      switchMap((token) => {
        if (!token) throw new Error('로그인이 필요합니다.');
        return of(token);
      }),
      tap((token) => this.refreshed$.next(token)), // 대기 중이던 다른 호출자들에게 broadcast
      finalize(() => { this.refreshing = false; })
    );
  }

  // * RefreshToken 갱신

  refreshToken(): Observable<IDataResponse<IRefreshTokenRequest> | null> {

    const accessToken = this.tokenStorage.getAccessToken();
    const refreshToken = this.tokenStorage.getRefreshToken();

    if (!accessToken || !refreshToken) return EMPTY;

    const tokenData = {
      accessToken: accessToken,
      refreshToken: refreshToken
    };

    return this.http.post<IDataResponse<IRefreshTokenRequest>>(`${this.apiUrl}/Auth/RefreshToken`, tokenData)
      .pipe(tap(
        res => {
          if (res.isSuccess && res.content) {
            this.tokenStorage.saveAccessToken(res.content.token!);
            this.tokenStorage.saveRefreshToken(res.content.refreshToken!);
          }
        }),
        catchError((err) => {
          console.error('[TokenService] 토큰갱신 실패:', err.status, err.message);
          return of(null);
        })
      );
  }
}
