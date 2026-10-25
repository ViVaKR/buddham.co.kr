import { Validators } from "@angular/forms";
import { IFormConfig } from "@app/core/interfaces/form/i-form.config";
import { INirvanaPayload } from "@app/pages/nirvana/interfaces/i-nirvana";

export function createNirvanaFormConfig(): IFormConfig<INirvanaPayload> {

  return {
    fields: { password: { defaultValue: '', validators: [Validators.required, Validators.minLength(6)] } }
  }
}