import { inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { UniqueValidators } from '@app/core/classes/unique-validators';
import { IUserRolePayload } from '@app/core/interfaces/api/models/i-user-role.model';
import { IFormConfig } from '@app/core/interfaces/form/i-form.config';
import { AccountRoleService } from '@app/pages/account-role/services/account-role.service';

export function createAccountRoleConfig(
  isEdit = true, // 수정모드 여부 를 판단 플래그 추가 (기본값은 신규)
  service = inject(AccountRoleService),
): IFormConfig<IUserRolePayload> {
  return {
    fields: {
      id: { defaultValue: '', disabled: true },
      name: {
        defaultValue: '',
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
          // 정규식 : 오직 영문 대소문자만 허용
          Validators.pattern(/^[a-zA-Z]*$/),
        ],
        asyncValidators: isEdit
          ? []
          : [
              UniqueValidators.createDuplicateValidator(
                (name: string) => service.checkName(name),
                'nameTaken',
              ),
            ],
        updateOn: 'change',
      },
      koName: {
        defaultValue: '',
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(20)],
      },
      description: {
        defaultValue: '',
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(500)],
      },
      sortOrder: { defaultValue: 0, validators: [Validators.required] },
      isActive: { defaultValue: false, validators: [Validators.required] },
      isSystem: { defaultValue: false, validators: [Validators.required] },
      rowVersion: { defaultValue: 0, validators: [Validators.required] },
    },
  };
}
