import { Validators } from '@angular/forms';
import { DharmaGuideCategory } from '@enums/dharma-guide-category';
import { IFormConfig } from '@interfaces/form/i-form.config';
import { IGuidePayload } from '@interfaces/api/request/i-guide.request';

export function createGuideConfig(): IFormConfig<IGuidePayload> {
  return {
    fields: {
      id: { defaultValue: '', disabled: true },
      dharmaGuideCategory: {
        defaultValue: DharmaGuideCategory.None,
        validators: [Validators.required],
      },
      title: {
        defaultValue: '',
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      },
      content: { defaultValue: '', validators: [Validators.required, Validators.minLength(2)] },
      rowVersion: {
        defaultValue: null,
        validators: [Validators.required, Validators.minLength(2)],
      },
    },
  };
}
