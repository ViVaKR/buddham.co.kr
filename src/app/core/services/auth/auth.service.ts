import { inject, Service } from '@angular/core';
import { IDataResponse } from '@app/core/interfaces/api/i-response';
import { IAuthIdentity } from '@app/core/interfaces/api/identity/i-auth.identity';
import { AuthStore } from '@app/core/services/auth/auth.store';
import { TokenStorage } from '@app/core/services/auth/token.storage';
import { UserService } from '@app/core/services/auth/user.service';
import { UserStore } from '@app/core/services/auth/user.store';
import { BaseService } from '@app/core/services/base/base.service';
import { IUserInfoView } from '@app/pages/user-info/interfaces/i-user-info';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

@Service()
export class AuthService extends BaseService {
  private readonly authStore = inject(AuthStore);
  private readonly userService = inject(UserService);
  private readonly userStore = inject(UserStore);
  private readonly tokenStorage = inject(TokenStorage);

  loadCurrentUser(): Observable<IUserInfoView | undefined | null> {
    const token = this.tokenStorage.getAccessToken();
    if (!token) return of(null);

    return this.userService.getUserDetail().pipe(
      tap((user) => {
        if (!user) return;
        this.authStore.setLogin(user);
        this.userStore.setUser(user);
      }),
      catchError((err: any) => {
        if (err.status === 401 || err.status === 403) {
          return of(null);
        }
        return throwError(() => err);
      }),
    );
  }

  /** 모든 로그인 성공(토큰 수령) 시의 공통로직 */
  public finalizeLogin(res: IDataResponse<IAuthIdentity>): void {
    const data = res.content;
    const accessToken = data?.token;
    const refreshToken = data?.refreshToken;
    if (accessToken) {
      this.tokenStorage.saveAccessToken(accessToken);
      if (refreshToken) this.tokenStorage.saveRefreshToken(refreshToken);

      this.userService.getUserDetail().subscribe({
        next: (user) => {
          this.authStore.setLogin(user!);
          this.userStore.setUser(user!);
        },
        error: (err) => console.error('인증 성공 후 유저 정보 로드 실패:', err),
      });
    }
  }
}
