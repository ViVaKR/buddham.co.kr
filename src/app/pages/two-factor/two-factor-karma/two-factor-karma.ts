import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { catchError, EMPTY, exhaustMap, filter, finalize, Subject, tap } from 'rxjs';
import { TwoFactorAuthService } from '@services/auth/two-factor-auth.service';
import { UserStore } from '@services/auth/user.store';
import { AlertService } from '@services/ui/alert.service';
import { AuthService } from '@services/auth/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoaderService } from '@services/ui/loader.service';
import { HttpErrorResponse } from '@angular/common/http';
import { IDataResponse } from '@interfaces/api/i-response';
import { IAuthIdentity } from '@interfaces/api/identity/i-auth.identity';
import { Paths } from '@data/menu-data';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IBottomSheet } from '@interfaces/ui/i-bottom-sheet';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatError, MatFormField, MatHint, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'two-factor-karma',
  imports: [
    MatButton,
    MatCheckbox,
    MatError,
    MatFormField,
    MatHint,
    MatIcon,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
  ],
  templateUrl: './two-factor-karma.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './two-factor-karma.scss',
})
export default class TwoFactorKarma {
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
