import { Validators } from '@angular/forms';
import { IFormConfig } from '@app/core/interfaces/form/i-form.config';
import { IConfirmEmailPayload } from '@pages/confirm-email/interfaces/i-confirm-email';

export function createConfirmEmailConfig(email: string, token: string): IFormConfig<IConfirmEmailPayload> {
  // const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
  return {
    fields: {
      email: {
        defaultValue: email,
        validators: [Validators.email, Validators.required],
      },
      token: {
        defaultValue: token,
        validators: [Validators.required],
      },
    },
  };
}
