import { inject, Service } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormControlsOf } from '@app/core/services/form/generic-form.service';
import { VerifyEmailService } from '@pages/verify-email/services/verify-email.service';
import { BaseCommandService } from '@services/base/base-command.service';
import { IVerifyEmailPayload } from '@pages/verify-email/interfaces/i-verify-email';

@Service()
export class VerifyEmailCommand extends BaseCommandService {

  private readonly service = inject(VerifyEmailService);
  public override async execute(form: FormGroup<FormControlsOf<IVerifyEmailPayload>>): Promise<boolean> {
    if (this.loading() || form.invalid) {
      form.markAllAsTouched();
      return false;
    }
    const payload = form.getRawValue() as IVerifyEmailPayload;
    console.log(payload);
    this.loading.set(true);
    this.loader.show();

    try {
      const res = await this.service.verifySendEmail(payload);
      if (res.isSuccess) {
        this.handleSuccess(res.message);
        return true;
      }
      // 실패 응답인 경우 의도적으로 에러를 throw 하여
      // catch 블록으로 통합 관리
      // 비즈니스 로직 실패도 Error 객체로 통일해서 던지면 아래 catch에서 예쁘게 모여 처리됩니다.
      throw new Error(res.message || '이메일 인증요청 실패!');
    } catch (err: unknown) {
      // 2. instanceof로 확실하게 손찌검(타입 가드)
      if (err instanceof Error) {
        // 시스템 에러와 비즈니스 실패 에러가 모두 여기서 처리됨
        this.handleError(err.message, '이메일 인증요청 실패!');
      }
      // else if (err instanceof HttpErrorResponse) {
      //   // 이제 여기서는 err.status, err.error 같은 HTTP 전용 속성을 맘껏 쓸 수 있습니다.
      //   this.handleError(err.error?.message || err.message);
      else {
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
