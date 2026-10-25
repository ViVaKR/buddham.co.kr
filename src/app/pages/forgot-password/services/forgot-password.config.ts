import { IFormConfig } from '@interfaces/form/i-form.config';
import { IForgotPasswordPayload } from '@pages/forgot-password/interfaces/i-forgot-password';
import { Validators } from '@angular/forms';

export function createForgotPasswordConfig(replyUrl: string): IFormConfig<IForgotPasswordPayload> {
  return {
    fields: {
      email: { defaultValue: '', validators: [Validators.required] },
      replyUrl: { defaultValue: replyUrl, validators: [Validators.required] },
    },
  };
}
