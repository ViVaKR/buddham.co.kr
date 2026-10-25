import { effect, inject, Injectable, signal } from '@angular/core';
import { IDataResponse } from '@app/core/interfaces/api/i-response';
import { IAuthIdentity } from '@app/core/interfaces/api/identity/i-auth.identity';
import { ISignInRequest } from '@app/core/interfaces/api/request/i-auth.request';
import { AuthService } from '@app/core/services/auth/auth.service';
import { DeviceFingerprinterService } from '@app/core/services/auth/device-fingerprinter.service';
import { BaseService } from '@app/core/services/base/base.service';
import { from, Observable, switchMap, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SignInService extends BaseService {

  private readonly authservice = inject(AuthService)
  protected fingerprinterService = inject(DeviceFingerprinterService);
  fingerprint = signal<string | null>(null);

  constructor() {
    super();
    effect(async () => {
      await this.getFingerprint();
    });
  }

  async getFingerprint() {
    const fp = await this.fingerprinterService.generateFingerprint();
    this.fingerprint.set(fp);
  }

  signIn(data: Omit<ISignInRequest, 'deviceFingerprint'>): Observable<IDataResponse<IAuthIdentity>> {
    return from(this.fingerprinterService.generateFingerprint()).pipe(
      switchMap(fp => {
        const payload: ISignInRequest = { ...data, deviceFingerprint: fp };
        return this.http.post<IDataResponse<IAuthIdentity>>(`${this.apiUrl}/Auth/SignIn`, payload);
      }),
      tap(res => {
        if (res.content?.requiresTwoFactor) {
          return;
        }
        if (res.isSuccess && !res.content?.requiresTwoFactor && res.content?.token) {
          this.authservice.finalizeLogin(res);
        }
      })
    );
  }
}
