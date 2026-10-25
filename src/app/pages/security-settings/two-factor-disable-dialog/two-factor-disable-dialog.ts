import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { catchError, EMPTY, tap } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { TwoFactorAuthService } from '@services/auth/two-factor-auth.service';
import { AlertService } from '@services/ui/alert.service';
import { CommonModule } from '@angular/common';
import { MATERIAL_COMMON } from '@shared/imports/material-imports';

@Component({
  selector: 'viv-two-factor-disable-dialog',
  imports: [CommonModule, ...MATERIAL_COMMON],
  templateUrl: './two-factor-disable-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './two-factor-disable-dialog.scss',
})
export default class TwoFactorDisableDialog {
  dialogRef = inject(MatDialogRef<TwoFactorDisableDialog>);
  private readonly twoFactorService = inject(TwoFactorAuthService);
  alertService = inject(AlertService);

  cancel() {
    this.dialogRef.close({ success: false });
  }

  confirm() {
    this.twoFactorService
      .disable2Fa()
      .pipe(
        tap(() => {
          this.alertService.openSheet([{ title: '완료', content: '2단계 인증이 해제되었습니다.' }]);
          this.dialogRef.close({ success: true });
        }),
        catchError((err) => {
          this.alertService.openSheet([
            { title: '오류', content: err.error?.message || '2FA 해제 중 오류가 발생했습니다.' },
          ]);
          return EMPTY;
        }),
      )
      .subscribe();
  }
}
