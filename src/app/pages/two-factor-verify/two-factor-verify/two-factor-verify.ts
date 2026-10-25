import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IDataResponse } from '@app/core/interfaces/api/i-response';
import { IAuthIdentity } from '@app/core/interfaces/api/identity/i-auth.identity';
import { IBottomSheet } from '@app/core/interfaces/ui/i-bottom-sheet';
import { AuthService } from '@app/core/services/auth/auth.service';
import { TwoFactorAuthService } from '@app/core/services/auth/two-factor-auth.service';
import { UserStore } from '@app/core/services/auth/user.store';
import { AlertService } from '@app/core/services/ui/alert.service';
import { LoaderService } from '@app/core/services/ui/loader.service';
import { Paths } from '@app/data/menu-data';
import { catchError, EMPTY, exhaustMap, filter, finalize, Subject, tap } from 'rxjs';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';

@Component({
  selector: 'two-factor-verify',
  imports: [...MATERIAL_COMMON],
  templateUrl: './two-factor-verify.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './two-factor-verify.scss',
})
export default class TwoFactorVerify {
  private submit$ = new Subject<void>();
  private submitRecovery$ = new Subject<void>();

  private readonly twoFactorService = inject(TwoFactorAuthService);

  userStore = inject(UserStore);
  alertService = inject(AlertService);
  authService = inject(AuthService);

  formBuilder = inject(FormBuilder);
  router = inject(Router);
  loader = inject(LoaderService);

  userEmail = signal<string>('');
  private _isRecoveryMode = signal<boolean>(false);
  public get isRecoveryMode() {
    return this._isRecoveryMode;
  }
  public set isRecoveryMode(value) {
    this._isRecoveryMode = value;
  }

  form: FormGroup = this.formBuilder.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    rememberMe: [false],
  });

  recoveryForm: FormGroup = this.formBuilder.group({
    recoveryCode: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    const nav = this.router.currentNavigation();
    const email = nav?.extras.state?.['email'];

    this.userEmail.set(email);
    console.log('nav ---> ', email, nav?.extras.state, this.userEmail());
    this.loader.hide();

    this.submit$
      .pipe(
        filter(() => {
          if (this.form.invalid) {
            this.form.markAllAsTouched();
            return false;
          }
          return true;
        }),
        tap(() => this.loader.show()),
        exhaustMap(() =>
          this.twoFactorService
            .login2FA(email, this.form.value.code, this.form.value.rememberMe)
            .pipe(
              catchError((err: HttpErrorResponse) => {
                this.alertService.openSheet([
                  {
                    title: '인증 실패',
                    content: err.error?.message || err.message || '인증 코드가 올바르지 않습니다.',
                  },
                ]);
                this.form.patchValue({ code: '' });
                return EMPTY;
              }),
              finalize(() => this.loader.hide()),
            ),
        ),
        tap(async (res: IDataResponse<IAuthIdentity>) => {
          if (res.isSuccess) {
            sessionStorage.removeItem('2fa-email');
            this.authService.finalizeLogin(res);
            this.alertService.openSheet([
              { title: '로그인 완료', content: res.message || '2단계 인증에 성공했습니다.' },
            ]);
            await this.router.navigate([Paths.Home.url]);
          } else {
            this.alertService.openSheet([{ title: '실패', content: res.message }]);
          }
        }),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.submitRecovery$
      .pipe(
        filter(() => {
          if (this.recoveryForm.invalid) {
            this.recoveryForm.markAllAsTouched();
            return false;
          }
          return true;
        }),
        tap(() => this.loader.show()),
        exhaustMap(() =>
          this.twoFactorService
            .signInWithRecoveryCode(email, this.recoveryForm.value.recoveryCode)
            .pipe(
              catchError((err: HttpErrorResponse) => {
                const msg: IBottomSheet[] = [
                  {
                    title: '복구 코드 인증 실패',
                    content: err.error?.message || err.message || '복구 코드가 올바르지 않습니다.',
                  },
                ];
                this.alertService.openSheet(msg);
                this.recoveryForm.patchValue({ recoveryCode: '' });
                return EMPTY;
              }),
              finalize(() => this.loader.hide()),
            ),
        ),
        tap(async (res) => {
          sessionStorage.removeItem('2fa-email');
          const data: IBottomSheet[] = [
            {
              title: '로그인 완료',
              content: res.message || '복구 코드로 로그인에 성공했습니다.',
            },
          ];
          this.alertService.openSheet(data);
          await this.router.navigate([Paths.Home.url]);
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  hasError(controlName: string, error: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.hasError(error) && (control.dirty || control.touched));
  }

  hasRecoveryError(controlName: string, error: string): boolean {
    const control = this.recoveryForm.get(controlName);
    return !!(control && control.hasError(error) && (control.dirty || control.touched));
  }

  toggleRecoveryMode() {
    this.isRecoveryMode.update((v) => !v);
    this.form.reset({ code: '', rememberMe: false });
    this.recoveryForm.reset({ recoveryCode: '' });
  }

  goBack() {
    sessionStorage.removeItem('2fa-email');
    this.router.navigate(['Login']);
  }

  onRecoverySubmit(event: Event) {
    event.preventDefault();
    this.submitRecovery$.next();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.submit$.next();
  }
}
