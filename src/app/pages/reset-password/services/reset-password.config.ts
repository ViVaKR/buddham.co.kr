import { AbstractControlOptions, Validators } from '@angular/forms';
import { IFormConfig } from '@interfaces/form/i-form.config';
import { IResetPasswordPayload } from '@pages/reset-password/interfaces/i-reset-password';
import { PasswordMatch } from '@classes/password-match';

export function createResetPasswordConfig(email: string, token: string): IFormConfig<IResetPasswordPayload> {

  const groupOptions: AbstractControlOptions = {
    validators: PasswordMatch.validate('newPassword', 'confirmPassword'),
  };

  return {
    fields: {
      email: {
        defaultValue: email,
        validators: [Validators.required, Validators.email],
      },
      token: { defaultValue: token, validators: [Validators.required] },
      newPassword: { defaultValue: '', validators: [Validators.required, Validators.minLength(6)] },
      confirmPassword: { defaultValue: '', validators: [Validators.required] },
    },
    groupOptions,
  };
}
