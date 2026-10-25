import { Validators } from "@angular/forms";
import { IFormConfig } from "@app/core/interfaces/form/i-form.config";
import { IUserInfoUpdateRole } from "@app/pages/user-info/interfaces/i-user-info";


export function createUserInfoConfig(): IFormConfig<IUserInfoUpdateRole> {

  return {
    fields: {
      id: {
        defaultValue: '',
        validators: [Validators.required]
      },
      roles: {
        defaultValue: [] as string[],
        validators: [Validators.required]
      }
    }
  }
}