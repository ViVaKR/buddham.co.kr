import { CommonModule } from '@angular/common';
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BaseDirective } from '@app/core/directives/base.directive';
import { TwoFactorAuthService } from '@app/core/services/auth/two-factor-auth.service';
import { AlertService } from '@app/core/services/ui/alert.service';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { catchError, EMPTY, finalize, of, tap } from 'rxjs';
import { ITwoFactorSetupIdentity } from '@interfaces/api/identity/i-two-factor-setup.identity';
import { Router } from '@angular/router';
import { Paths } from '@app/data/menu-data';

@Component({
  selector: 'viv-two-factor-setup-dialog',
  imports: [CommonModule, ...MATERIAL_COMMON],
  templateUrl: './two-factor-setup-dialog.html',
  styleUrl: './two-factor-setup-dialog.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class TwoFactorSetupDialog {

  private router = inject(Router);
  dialogRef = inject(MatDialogRef<TwoFactorSetupDialog>);
  private readonly twoFactorService = inject(TwoFactorAuthService);
  alertService = inject(AlertService);
  fb = inject(FormBuilder);

  step = signal(0);
  isLoading = signal(true);
  isVerifying = signal(false);
  setupData = signal<ITwoFactorSetupIdentity | null>(null);
  recoveryCodes = signal<string[]>([]);

  verifyForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  constructor() {
    // Step 1: QR 코드 생성 요청
    this.twoFactorService
      .enable2Fa()
      .pipe(
        tap((res) => {
          this.setupData.set(res.content!);
          this.isLoading.set(false);
        }),
        catchError((err) => {
          this.alertService.openSheet([
            {
              title: '오류',
              content: err.error?.message || '2FA 설정 중 오류가 발생했습니다.',
            },
          ]);
          this.dialogRef.close({ success: false });
          return of(null);
        }),
      )
      .subscribe();
  }

  // ✅ 다음 단계로
  nextStep() {
    this.step.update((v) => v + 1);
  }

  // ✅ 이전 단계로
  prevStep() {
    this.step.update((v) => v - 1);
  }

  verifyCode() {
    if (this.verifyForm.invalid) return;

    this.isVerifying.set(true);
    const code = this.verifyForm.value.code!;

    this.twoFactorService
      .verify2Fa(code)
      .pipe(
        tap((res) => {
          this.recoveryCodes.set(res.content?.recoveryCodes!);
          this.step.set(2);
          this.alertService.openSheet([
            {
              title: '성공',
              content: '2단계 인증이 활성화되었습니다!',
            },
          ]);
        }),
        catchError((err) => {
          this.alertService.openSheet([
            {
              title: '인증 실패',
              content: err.error?.message || '인증 코드가 올바르지 않습니다.',
            },
          ]);
          this.verifyForm.patchValue({ code: '' });
          return EMPTY;
        }),
        finalize(() => {
          this.isVerifying.set(false);
          this.router.navigate([Paths.SignIn.url]);
        }),
      )
      .subscribe();
  }

  downloadRecoveryCodes() {
    const blob = new Blob([this.recoveryCodes().join('\n')], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    a.download = `recovery-codes-${new Date().getTime()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  copyRecoveryCodes() {
    navigator.clipboard.writeText(this.recoveryCodes().join('\n')).then((r) => {
      console.log(r);
    });

    this.alertService.openSheet([
      { title: '복사 완료', content: '복구 코드가 클립보드에 복사되었습니다.' },
    ]);
  }

  complete() {
    this.dialogRef.close({ success: true });
  }
}
