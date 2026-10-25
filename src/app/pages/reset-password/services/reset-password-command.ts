import { inject, Service } from '@angular/core';
import { BaseCommandService } from '@services/base/base-command.service';
import { ResetPasswordService } from '@pages/reset-password/services/reset-password.service';
import { FormGroup } from '@angular/forms';
import { FormControlsOf } from '@app/core/services/form/generic-form.service';
import { IResetPasswordPayload } from '@pages/reset-password/interfaces/i-reset-password';

@Service()
export class ResetPasswordCommand extends BaseCommandService {

  private readonly service = inject(ResetPasswordService);

  public override async execute(
    form: FormGroup<FormControlsOf<IResetPasswordPayload>>
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
    const payload = rawValue as IResetPasswordPayload;

    this.loading.set(true);
    this.loader.show();

    try {
      const res = await this.service.resetPassword(payload);
      if (res.isSuccess) {
        this.handleSuccess('비밀번호 분실신고 완료! 새로운 비밀번호로 로그인하세요');
        return true;
      } else {
        // 🔴 2. 실패 시: .NET 백엔드가 정성껏 포장해 준 비즈니스 실패 메시지를 그대로 전달!
        // 예: "존재하지 않는 회원 정보입니다.", "이미 처리된 요청입니다." 등
        this.handleError(res.message || '요청 처리 실패', '비밀번호 변경 실패');
      }
      return false;
    } finally {
      this.loading.set(false);
      this.loader.hide();
    }
  }
}
