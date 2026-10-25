// * signup-karma.config.ts
import { inject } from '@angular/core';
import { Validators, AbstractControlOptions } from '@angular/forms';
import { PasswordMatch } from '@app/core/classes/password-match';
import { UniqueValidators } from '@app/core/classes/unique-validators';
import { ISignUpModel } from '@app/core/interfaces/api/request/i-sign-up.request';
import { IFormConfig } from '@app/core/interfaces/form/i-form.config';
import { UserService } from '@app/core/services/auth/user.service';

export function createSignUpFormConfig(service = inject(UserService))
  : IFormConfig<ISignUpModel> {

  const groupOptions: AbstractControlOptions = {
    validators: PasswordMatch.validate('password', 'confirmPassword')
  };

  return {
    fields: {
      email: {
        defaultValue: '',
        validators: [Validators.email, Validators.required],
        asyncValidators: [UniqueValidators.createDuplicateValidator((v: string) => service.checkEmail(v), 'emailTaken')],
        updateOn: 'change',
      },
      fullName: {
        defaultValue: '',
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)]
      },
      pseudonym: {
        defaultValue: '',
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
        asyncValidators: [
          UniqueValidators.createDuplicateValidator((v: string) => service.checkPseudonym(v), 'pseudonymTaken')],
        updateOn: 'change',
      },
      password: { defaultValue: '', validators: [Validators.required, Validators.minLength(6)] },
      confirmPassword: { defaultValue: '', validators: Validators.required }
    },
    groupOptions,
  };
}
