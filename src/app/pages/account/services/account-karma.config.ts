import { IFormConfig } from '@app/core/interfaces/form/i-form.config';
import { Validators } from '@angular/forms';
import { IUserInfoPayload, IUserInfoView } from '@app/pages/user-info/interfaces/i-user-info';
import { getBrowserLocale, getBrowserTimeZone } from '@app/shared/utility/utility';
import { UserService } from '@app/core/services/auth/user.service';

export function createAccountConfig(
  data: IUserInfoView,
): IFormConfig<IUserInfoPayload> {
  return {
    fields: {
      id: { defaultValue: data.id },
      userName: {
        defaultValue: data.userName,
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)]
      },
      fullName: {
        defaultValue: data.fullName,
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
      },
      pseudonym: {
        defaultValue: data.pseudonym,
        validators: [Validators.required]
      },
      email: { defaultValue: data.email, validators: [Validators.required, Validators.email] },
      avatar: {
        defaultValue: data.avatar,
        validators: [Validators.required, Validators.minLength(4), Validators.maxLength(255)],
      },
      timeZone: {
        defaultValue: data.timeZone || getBrowserTimeZone(),
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
      },
      locale: {
        defaultValue: data.locale || getBrowserLocale(),
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(20)],
      },
      provider: {
        defaultValue: data.provider,
        validators: [Validators.required, Validators.min(2), Validators.max(20)],
      },
      introduction: { defaultValue: data.introduction },
    },
  };
}
