import { effect, inject, Injectable, signal } from '@angular/core';
import { IDataResponse, IResponse } from '@app/core/interfaces/api/i-response';
import { IAuthIdentity } from '@app/core/interfaces/api/identity/i-auth.identity';
import { ITwoFactorSetupIdentity } from '@app/core/interfaces/api/identity/i-two-factor-setup.identity';
import { ITwoFactorVerifyIdentity } from '@app/core/interfaces/api/identity/i-two-factor-verify.identity';
import { IRecoveryCodeLoginRequest } from '@app/core/interfaces/api/request/i-recovery-code-login.request';
import { ITwoFactorLoginRequest } from '@app/core/interfaces/api/request/i-two-factor-login.request';
import { AuthService } from '@app/core/services/auth/auth.service';
import { DeviceFingerprinterService } from '@app/core/services/auth/device-fingerprinter.service';
import { BaseService } from '@app/core/services/base/base.service';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TwoFactorAuthService extends BaseService {
  private readonly authService = inject(AuthService);
  private fpService = inject(DeviceFingerprinterService);
  fingerprint = signal<string | null>(null);

  constructor() {
    super();
    effect(async () => {
      const fp = await this.fpService.generateFingerprint();
      this.fingerprint.set(fp);
    });
  }

  enable2Fa(): Observable<IDataResponse<ITwoFactorSetupIdentity>> {
    return this.http.post<IDataResponse<ITwoFactorSetupIdentity>>(
      `${this.apiUrl}/TwoFactorAuth/Enable2fa`,
      {},
    );
  }

  verify2Fa(code: string): Observable<IDataResponse<ITwoFactorVerifyIdentity>> {
    return this.http.post<IDataResponse<ITwoFactorVerifyIdentity>>(
      `${this.apiUrl}/TwoFactorAuth/Verify2fa`,
      { code },
    );
  }

  disable2Fa(): Observable<IResponse> {
    return this.http.post<IResponse>(`${this.apiUrl}/TwoFactorAuth/Disable2fa`, {});
  }

  getRecoveryCodes(): Observable<IDataResponse<IAuthIdentity>> {
    return this.http.get<IDataResponse<IAuthIdentity>>(
      `${this.apiUrl}/TwoFactorAuth/LoginRecoveryCode`,
    );
  }

  // ================= 2FA 로그인
  login2FA(
    email: string,
    code: string,
    rememberDevice: boolean,
  ): Observable<IDataResponse<IAuthIdentity>> {
    const payload: ITwoFactorLoginRequest = {
      email: email,
      code: code,
      rememberDevice: rememberDevice,
      deviceFingerprint: this.fingerprint() ?? '',
    };
    console.log(payload);
    return this.http
      .post<IDataResponse<IAuthIdentity>>(`${this.apiUrl}/TwoFactorAuth/Login2fa`, payload)
      .pipe(
        tap((res) => {
          if (res.isSuccess) this.authService.finalizeLogin(res);
          else {
            this.alertService.openSheet([
              {
                title: '2FA 로그인 실패',
                content: res.message,
              },
            ]);
          }
        }),
      );
  }

  /**
   * 복구 코드를 사용한 로그인
   */
  signInWithRecoveryCode(
    email: string,
    recoveryCode: string,
  ): Observable<IDataResponse<IAuthIdentity>> {
    const payload: IRecoveryCodeLoginRequest = {
      email: email,
      recoveryCode: recoveryCode.replace(/[-\s]/g, ''), // 하이픈과 공백 제거
    };

    return this.http
      .post<IDataResponse<IAuthIdentity>>(`${this.apiUrl}/TwoFactorAuth/LoginRecoveryCode`, payload)
      .pipe(
        tap((res) => {
          if (res.isSuccess && res.content?.token) {
            this.authService.finalizeLogin(res);
          } else {
            this.alertService.openSheet([
              {
                title: '2FA 복구코드 로그인 실패',
                content: res.message,
              },
            ]);
          }
        }),
      );
  }
}
