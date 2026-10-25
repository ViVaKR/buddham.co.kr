import { inject, Service } from '@angular/core';
import { BaseCommandService } from '@services/base/base-command.service';
import { ForgotPasswordService } from '@pages/forgot-password/services/forgot-password.service';
import { FormGroup } from '@angular/forms';
import { FormControlsOf } from '@app/core/services/form/generic-form.service';
import { IForgotPasswordPayload } from '@pages/forgot-password/interfaces/i-forgot-password';

@Service()
export class ForgotPasswordCommand extends BaseCommandService {
  private readonly service = inject(ForgotPasswordService);

  public override async execute(
    form: FormGroup<FormControlsOf<IForgotPasswordPayload>>,
  ): Promise<boolean> {
    if (this.loading() || form.invalid) {
      form.markAllAsTouched();
      this.alertService.openSheet([
        {
          title: '이미 진행 중이거나 잘못된 요청입니다.',
          content: '잠시후 다시 진행하여 주세요',
        },
      ]);
      return false;
    }

    const rawValue = form.getRawValue();
    const payload = rawValue as IForgotPasswordPayload;

    this.loading.set(true);
    this.loader.show();

    try {
      const res = await this.service.forgotPassword(payload);
      if (res.isSuccess) {
        this.alertService.openSheet([
          {
            title: '비밀번호 분실 신고 완료',
            content: `${res.content?.pseudonym}: ${res.content?.message}`,
          },
        ]);
        return true;
      } else {
        this.handleError(
          res.message,
          `${res.content?.message}, ${res.validationErrors}, ${res.traceId}`,
        );
      }
      return false;
    } finally {
      this.loading.set(false);
      this.loader.hide();
    }
  }
}
