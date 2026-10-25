import { inject, Service } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormControlsOf } from '@app/core/services/form/generic-form.service';
import { BaseCommandService } from '@services/base/base-command.service';
import { ConfirmEmailService } from '@pages/confirm-email/services/confirm-email.service';
import { IConfirmEmailPayload } from '@pages/confirm-email/interfaces/i-confirm-email';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '@services/auth/user.service';
import { AuthService } from '@services/auth/auth.service';
import { catchError, EMPTY, lastValueFrom, take } from 'rxjs';

@Service()
export class ConfirmEmailCommand extends BaseCommandService {
  private readonly service = inject(ConfirmEmailService);
  private readonly authService = inject(AuthService);
  public override async execute(form: FormGroup<FormControlsOf<IConfirmEmailPayload>>): Promise<boolean> {
    if (this.loading() || form.invalid) {
      form.markAllAsTouched();
      return false;
    }
    const payload = form.getRawValue() as IConfirmEmailPayload;
    this.loading.set(true);
    this.loader.show();

    try {
      const res = await this.service.confirmSendEmail(payload);
      if (res.isSuccess) {
        this.handleSuccess(res.message);
        await lastValueFrom(
          this.authService.loadCurrentUser().pipe(
            take(1),
            catchError(() => EMPTY),
          ),
        );
        return true;
      }
      throw new Error();
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.handleError(err.message, '이메일 확인요청 실패');
      } else {
        // 만에 하나 문자열이나 이상한 게 던져졌을 때를 위한 방어막
        this.handleError(String(err) || '알 수 없는 시스템 오류가 발생했습니다.');
      }
      return false;
    } finally {
      this.loading.set(false);
      this.loader.hide();
    }
  }
}
