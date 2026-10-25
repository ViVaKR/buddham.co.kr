import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidatorFn, FormControl, FormGroupDirective } from '@angular/forms';
import { IFieldConfig } from '@app/core/interfaces/form/i-field.config';
import { IFormConfig } from '@app/core/interfaces/form/i-form.config';
import { BaseFormService } from '@app/core/services/base/base-form.service';
import { Observable, of } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

// 에러 메시지 맵
const VALIDATION_MESSAGES: Record<string, string | ((err: any) => string)> = {
  required: '필수 입력 항목입니다.',
  requiredTrue: '필수 동의 항목입니다.', // 🚀 Angular 순정 체크박스
  email: '올바른 이메일 형식이 아닙니다.',
  minlength: (e) => `최소 ${e.requiredLength}자 이상 입력해주세요.`,
  maxlength: (e) => `최대 ${e.requiredLength}자까지 입력 가능합니다.`,
  min: (e) => `${e.min} 이상의 값을 입력해주세요.`,
  max: (e) => `${e.max} 이하의 값을 입력해주세요.`,
  pattern: '올바른 형식이 아닙니다.',

  // * Custom Sync
  invalidEmail: '올바른 이메일 형식이 아닙니다.',
  missingUppercase: '대문자를 포함해야 합니다.',
  missingLowercase: '소문자를 포함해야 합니다.',
  missingNumber: '숫자를 포함해야 합니다.',
  missingSpecial: '특수문자(!@#$%^&*)를 포함해야 합니다.',
  passwordMismatch: '비밀번호가 일치하지 않습니다.',
  noWhitespace: '공백만으로는 입력할 수 없습니다.',
  mustBeTrue: '동의가 필요합니다.',

  numbersOnly: '숫자만 입력 가능합니다.',
  invalidPhone: '올바른 전화번호 형식이 아닙니다.',
  futureDateNotAllowed: '미래 날짜는 선택할 수 없습니다.',
  fileTooLarge: (e) => `파일 크기는 ${e.maxSizeMB}MB 이하여야 합니다.`,
  // 🚀 [추가 예정인 미래 대비용 동기 검증]
  invalidDate: '올바른 날짜 형식이 아닙니다.',
  dateRangeInvalid: '시작일은 종료일보다 빠를 수 없습니다.',
  // * Async
  emailTaken: '이미 사용 중인 이메일입니다.',
  nicknameTaken: '이미 사용 중인 닉네임입니다.',
  pseudonymTaken: '이미 사용 중인 필명입니다.',
  wrongPassword: '현재 비밀번호가 올바르지 않습니다.',
  serverError: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

export type FormControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};

@Injectable({ providedIn: 'root' })
export class GenericFormService extends BaseFormService {

  // ─────────────────────────────────────────
  // 1. 폼 생성
  // ─────────────────────────────────────────
  build<T extends Record<string, any>>(config: IFormConfig<T>): FormGroup<FormControlsOf<T>> {
    const controls = Object.entries(config.fields).reduce(
      (acc, [key, field]) => {
        const { defaultValue = '', disabled = false, validators, asyncValidators, updateOn } = field;

        // 🚀 [51세기형 핵심 주파수 전환 부품!]
        // disabled가 true이면 앵귤러 정품 객체인 { value, disabled } 핏으로 만들어주고,
        // 일반 필드이면 그냥 순정 defaultValue를 장착해 주는 스마트 분기 처리!
        const controlState = disabled ? { value: defaultValue, disabled: true } : defaultValue;

        acc[key] =
          asyncValidators || updateOn
            ? [controlState, { validators, asyncValidators, updateOn }]
            : [controlState, validators ?? []];

        return acc;
      },
      {} as Record<string, any>,
    );

    return this.fb.group(controls, config.groupOptions ?? {}) as FormGroup<FormControlsOf<T>>;
  }

  // ─────────────────────────────────────────
  // 2. 에러 확인 & 메시지
  // ─────────────────────────────────────────

  /** 필드 에러 메시지 (Matcher 기준 타이밍이 되었을 때만 반환) */
  getErrorMessage(
    form: FormGroup,
    field: string,
    directive?: FormGroupDirective | null

  ): string {

    const control = form.get(field);
    if (!control?.errors || !control.touched) return '';

    // 마우스 포커스 뿐만 아니라 Submit 여부 까지 판단하는 최강 조합
    const isError = this.matcher.isErrorState(control, directive || null);
    if (!isError) return '';

    const [key, value] = Object.entries(control.errors)[0];
    const msg = VALIDATION_MESSAGES[key];
    return typeof msg === 'function' ? msg(value) : (msg ?? `${key} 오류`);
  }

  /** 폼 레벨 에러 메시지 */
  getFormErrorMessage(form: FormGroup, errorKey: string): string {
    const error = form.errors?.[errorKey];
    if (!error) return '';

    const msg = VALIDATION_MESSAGES[errorKey];
    if (msg) return typeof msg === 'function' ? msg(error) : msg;
    if (typeof error === 'object' && error['message']) return error['message'];
    return `폼 검증 실패: ${errorKey}`;
  }

  /** 필드가 특정 폼 레벨 에러에 영향을 받는지 */
  isFieldAffectedByFormError(form: FormGroup, field: string): boolean {
    return Object.values(form.errors ?? {}).some(
      (err) =>
        typeof err === 'object' &&
        ['conflictFields', 'affectedFields', 'requiredFields'].some((key) => err[key]?.includes(field)),
    );
  }

  // ─────────────────────────────────────────
  // 3. 필드 제어
  // ─────────────────────────────────────────

  /** 필드 값 가져오기 */
  getValue<T = unknown>(form: FormGroup, field: string): T {
    return form.get(field)?.value as T;
  }

  /** 필드 값 설정 (dirty + touched 자동 마킹) */
  setValue(form: FormGroup, field: string, value: unknown): void {
    const control = form.get(field);
    if (control) {
      control.setValue(value);
      control.markAsDirty();
      control.markAsTouched();
    }
  }

  /** 필드 활성/비활성 토글 */
  toggleField(form: FormGroup, field: string, enable: boolean): void {
    const control = form.get(field);
    enable ? control?.enable({ emitEvent: false }) : control?.disable({ emitEvent: false });
  }

  /** 조건부 Validator 설정 */
  setConditionalValidator(
    form: FormGroup,
    field: string,
    validators: ValidatorFn | ValidatorFn[],
    condition: boolean,
  ): void {
    const control = form.get(field);
    if (!control) return;
    condition ? control.setValidators(validators) : control.clearValidators();
    control.updateValueAndValidity();
  }

  /** 비동기 검증 진행 중 여부 */
  isPending(form: FormGroup, field: string): boolean {
    return form.get(field)?.pending ?? false;
  }

  // ─────────────────────────────────────────
  // 4. 폼 상태 & 마킹
  // ─────────────────────────────────────────

  /** 폼 전체 상태 객체 */
  getStatus(form: FormGroup) {
    return {
      valid: form.valid,
      pending: form.pending,
      touched: form.touched,
      dirty: form.dirty,
      errors: form.errors,
      fields: Object.keys(form.controls).map((key) => ({
        name: key,
        valid: form.get(key)?.valid,
        pending: form.get(key)?.pending,
        touched: form.get(key)?.touched,
        dirty: form.get(key)?.dirty,
        errors: form.get(key)?.errors,
        value: form.get(key)?.value,
        disabled: form.get(key)?.disabled,
      })),
    };
  }

  /** 모든 필드 touched + dirty 마킹 (submit 직전 필수) */
  markAllTouched(formGroup: FormGroup): void {
    this._traverseControls(formGroup, (c) => {
      c.markAsTouched({ onlySelf: true });
      c.markAsDirty({ onlySelf: true });
    });
  }

  /** 특정 필드만 검증 */
  validateField(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    if (!control) return false;
    control.markAsTouched();
    control.updateValueAndValidity();
    return control.valid;
  }

  /** 여러 필드 검증 */
  validateFields(form: FormGroup, fields: string[]): boolean {
    return fields.every((f) => this.validateField(form, f));
  }

  // ─────────────────────────────────────────
  // 5. 리셋
  // ─────────────────────────────────────────

  /**
   * 통합 리셋 - nested FormGroup 포함 재귀 처리
   * config 전달 시 disabled 상태도 복원
   */
  reset(formGroup: FormGroup, value?: unknown, config?: IFormConfig<any>): void {
    // ─── 1단계: 값 초기화 ───────────────────

    // value 없으면 -> 모든 필드 null 로
    // value 있으면 -> 해당 값으로 세팅
    // ex) reset(form, 'test@test.com')

    formGroup.reset(value);

    // ─── 2단계: 상태 초기화 (재귀) ──────────
    this._traverseControls(formGroup, (c) => {
      c.setErrors(null); // 에러 메시지 제거
      c.markAsUntouched(); // 빨간줄 제거
      c.markAsPristine(); // 변경 감지 초기화
      c.updateValueAndValidity({ emitEvent: false }); // 검증 재실행
    });
    // nested FormGroup 도 재귀로 처리되는 것이 핵심!

    // disabled 상태 복원
    if (config) {
      Object.entries(config.fields).forEach(([key, field]) => {
        this.toggleField(formGroup, key, !(field as IFieldConfig).disabled);
      });
    }

    // config 없으면 -> disabled 상태 그냥 유지
    // config 있으면 -> 원래 설정 대로 복원
    // ex) 회원정보 수정 폼에서 이메일은 항상 disabled

    // ─── 4단계: 폼 전체 재검증 ──────────────
    formGroup.updateValueAndValidity({ emitEvent: false });

    // emitEvent: false -> valueChanges 이벤트 발생 안 함

    // 불필요한 APi 호출 방지

    // --> 실제 사용 시나리오
    /*
    // * 시나리오 1: 단순 리셋 (빈 폼으로)
    this.fbService.reset(this.form);

    // * 시나리오 2: 특정 값으로 리셋
    this.fbService.reset(this.form, { email: '', fullName: '홍길동' });

    // * 시나리오 3: disabled 상태까지 완전 복원
    this.fbService.reset(this.form, {}, createSignUpFormConfig());
    // 👆 config 의 disabled 설정대로 필드 활성/비활성 복원
    */
  }

  // ─────────────────────────────────────────
  // 6. 감시
  // ─────────────────────────────────────────

  /** 폼 전체 변경 감시 */
  watchForm(form: FormGroup, debounceMs = 300): Observable<unknown> {
    return form.valueChanges.pipe(debounceTime(debounceMs));
  }

  /** 특정 필드 변경 감시 */
  watchField(form: FormGroup, field: string, debounceMs = 300): Observable<unknown> {
    return form.get(field)?.valueChanges.pipe(debounceTime(debounceMs)) ?? of(null);
  }

  // ─────────────────────────────────────────
  // 7. 스냅샷
  // ─────────────────────────────────────────

  saveSnapshot(form: FormGroup) {
    return { value: form.getRawValue(), timestamp: new Date().toISOString() };
  }

  restoreSnapshot(form: FormGroup, snapshot: ReturnType<this['saveSnapshot']>): void {
    form.patchValue(snapshot.value);
    form.updateValueAndValidity();
  }

  // ─────────────────────────────────────────
  // 8. 유틸 & 디버그
  // ─────────────────────────────────────────

  getRawValue(form: FormGroup) {
    return form.getRawValue();
  }
  getValue$(form: FormGroup) {
    return form.value;
  }
  isChanged(form: FormGroup) {
    return form.dirty || form.touched;
  }
  compareValues(a: unknown, b: unknown) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  /** 콘솔 디버깅 (개발 전용) */
  debug(form: FormGroup, title = 'Form Debug'): void {
    const status = this.getStatus(form);
    console.group(title);
    console.log('Form Status:', status);
    console.table(status.fields);
    console.groupEnd();
  }

  // ─────────────────────────────────────────
  // Private
  // ─────────────────────────────────────────

  /** 재귀 컨트롤 순회 (reset, markAll 에서 공통 사용) */
  private _traverseControls(formGroup: FormGroup, fn: (control: AbstractControl) => void): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this._traverseControls(control, fn);
      } else if (control) {
        fn(control);
      }
    });
  }
}
