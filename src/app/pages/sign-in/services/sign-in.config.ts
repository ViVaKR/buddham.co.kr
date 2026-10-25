import { Validators } from "@angular/forms";
import { ISignInModel } from "@app/core/interfaces/api/request/i-sign-in.request";
import { IFormConfig } from "@app/core/interfaces/form/i-form.config";

export function createSignInFormConfig(): IFormConfig<ISignInModel> {

  return {
    fields: {
      email: {
        defaultValue: '',
        validators: [Validators.email, Validators.required],
        updateOn: 'blur'
      },
      password: {
        defaultValue: '',
        validators: [Validators.required, Validators.minLength(6), Validators.maxLength(50)],
        updateOn: 'change'
      },
      ipAddress: {
        defaultValue: '',
        validators: [Validators.minLength(7)]
      }
    },
  };
}
