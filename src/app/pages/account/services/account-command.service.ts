import { inject, Service } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BaseCommandService } from '@app/core/services/base/base-command.service';
import { FormControlsOf } from '@app/core/services/form/generic-form.service';
import { AccountService } from '@app/pages/account/services/account.service';
import { IUserInfoPayload } from '@app/pages/user-info/interfaces/i-user-info';

@Service()
export class AccountCommandService extends BaseCommandService {

  private readonly service = inject(AccountService);
  public override async execute(form: FormGroup<FormControlsOf<IUserInfoPayload>>): Promise<boolean> {

    if (this.loading() || form.invalid) {
      form.markAllAsTouched();
      this.handleError('잠시 후 다시 진행하여 주세요', '이미 진행중이거나 잘못된 요청입니다.');
      return false;
    }

    const rawValue = form.getRawValue();
    const payload = rawValue as IUserInfoPayload;

    this.loading.set(true);
    this.loader.show();

    try {
      const res = await this.service.createOrUpdate(payload, payload.id);
      if (res.isSuccess) {
        this.handleSuccess(res.message);
        return true;
      }

      throw new Error(res.message || '회원정보 수정 실패')
    }
    catch (err: unknown) {

      if (err instanceof Error) {
        this.handleError(err.message);
      } else {
        this.handleSystemError(String(err));
      }
      return false;
    }
    finally {
      this.loading.set(false);
      this.loader.hide();
    }
  }
}
