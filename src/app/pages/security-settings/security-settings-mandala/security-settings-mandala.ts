import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '@services/auth/auth.service';
import { UserStore } from '@services/auth/user.store';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from '@services/ui/alert.service';
import TwoFactorDisableDialog from '@pages/security-settings/two-factor-disable-dialog/two-factor-disable-dialog';
import { Paths } from '@data/menu-data';
import { TwoFactorSetupDialog } from '@pages/security-settings/two-factor-setup-dialog/two-factor-setup-dialog';

@Component({
  selector: 'security-settings-mandala',
  imports: [
    MatButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatIcon,
  ],
  templateUrl: './security-settings-mandala.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './security-settings-mandala.scss',
})
export default class SecuritySettingsMandala {
  private authService = inject(AuthService);
  private userStore = inject(UserStore);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private alertService = inject(AlertService);

  check = signal<boolean>(true);

  is2FAEnabled = computed(() => {
    return this.userStore.user()?.twoFactorEnabled ?? false;
  });

  openSetup2FA() {
    const dialogRef = this.dialog.open(TwoFactorSetupDialog, {
      width: '600px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.alertService.openSheet([
          {
            title: 'Success',
            content: result.message,
          },
        ]);
      }
    });
  }

  openDisable2FA() {
    const dialogRef = this.dialog.open(TwoFactorDisableDialog, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.authService.loadCurrentUser().subscribe((user) => {
          this.alertService.openSheet([
            {
              title: `갱신된 사용자: ${user?.pseudonym}`,
            },
          ]);
        });
      }
    });
  }

  changePassword() {
    this.router.navigate([`${Paths.Account.url}/${Paths.ChangePassword.url}`]).then((x) => {
      console.log(x);
    });
  }
}
