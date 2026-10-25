import { inject, Service } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ISignUpModel, ISignUpRequest } from '@app/core/interfaces/api/request/i-sign-up.request';
import { BaseCommandService } from '@app/core/services/base/base-command.service';
import { FormControlsOf } from '@app/core/services/form/generic-form.service';
import { Paths } from '@app/data/menu-data';
import { SignInService } from '@app/pages/sign-in/services/sign-in.service';
import { SignUpService } from '@app/pages/sign-up/services/sign-up.service';
import { firstValueFrom } from 'rxjs';

@Service()
export class SignUpKarmaService extends BaseCommandService {

  private readonly signUpService = inject(SignUpService);
  private readonly signInService = inject(SignInService)

  async execute(form: FormGroup<FormControlsOf<ISignUpModel>>): Promise<any> {

    if (this.loading() || form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const rawFormValue = form.getRawValue();
    const { confirmPassword, ...signUpPayload } = rawFormValue;
    const payload: ISignUpRequest = signUpPayload;

    this.loading.set(true);
    this.loader.show();
    try {
      const signUpRes = await firstValueFrom(this.signUpService.signUp(payload));

      if (!signUpRes.isSuccess) {
        this.handleError(signUpRes.message, "회원가입 실패");
        return;
      }
      const signInRes = await firstValueFrom(this.signInService.signIn(payload));

      if (signInRes?.isSuccess) {
        this.handleNavigate([Paths.Home.url], signInRes.message, "로그인 완료");
      } else {
        this.handleError(`${signInRes.message}\n회원가입은 완료되었으나 로그인에 실패했습니다. 직접 로그인해주세요.`, "로그인 실패");
      }
    } finally {
      this.loading.set(false);
      this.loader.hide();
    }
  }
}
