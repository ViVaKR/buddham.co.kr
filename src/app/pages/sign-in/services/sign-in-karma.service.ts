import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ISignInRequest } from '@app/core/interfaces/api/request/i-auth.request';
import { ISignInModel } from '@app/core/interfaces/api/request/i-sign-in.request';
import { BaseCommandService } from '@app/core/services/base/base-command.service';
import { FormControlsOf } from '@app/core/services/form/generic-form.service';
import { Paths } from '@app/data/menu-data';
import { SignInService } from '@app/pages/sign-in/services/sign-in.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SignInKarmaService extends BaseCommandService {
  private readonly service = inject(SignInService);

  public override async execute(
    form: FormGroup<FormControlsOf<ISignInModel>>
  ): Promise<any> {

    if (this.loading() || form.invalid) {
      form.markAllAsTouched();
      return;
    }
    const rawFormValue = form.getRawValue();
    const { ...signInPayload } = rawFormValue;
    const payload: ISignInRequest = signInPayload;

    this.loading.set(true);
    this.loader.show();

    try {
      const res = await firstValueFrom(this.service.signIn(payload));
      if (res.isSuccess) {
        const is2FA = res.content?.requiresTwoFactor || (res as any).requiresTwoFactor;

        if (is2FA) {
          this.navigator.withState([Paths.TwoFactorVerify.url], { email: payload.email });
        } else {
          this.handleNavigate(
            [Paths.Home.url],
            `${res.meta.pseudonym}님 환영합니다.`,
            '로그인 완료',
          );
        }
      } else {
        this.handleError(res.message, res.content?.message);
      }
    } finally {
      this.loading.set(false);
      this.loader.hide();
    }
  }
}
