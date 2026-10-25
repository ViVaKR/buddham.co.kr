import { IVerifyEmailPayload } from '@pages/verify-email/interfaces/i-verify-email';
import { IFormConfig } from '@interfaces/form/i-form.config';
import { Validators } from '@angular/forms';

export function createVerifyEmailConfig(email: string, replyUrl: string): IFormConfig<IVerifyEmailPayload>{

  return {
    fields: {
      email: {
        defaultValue: email,
        validators: [Validators.required, Validators.email]
      },
      replyUrl: {
        defaultValue: replyUrl,
        validators: [Validators.required]
      }
    }
  }
}