import { AsyncValidatorFn, ValidatorFn } from '@angular/forms';

export interface IFieldConfig {
    defaultValue?: unknown;
    validators?: ValidatorFn | ValidatorFn[];
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[];

    // change (기본값) : 값이 바뀔때마다 즉시 업데이트
    // blur (입력 포커스를 잃을때) : 사용자가 입력을 마치고 다른곳을 클릭하여 포커스 벗어날때
    // submit (폼 제출 시) : 폼이 제출될때 만 값이 업데이트 됨
    updateOn?: 'change' | 'blur' | 'submit';
    disabled?: boolean;
}
