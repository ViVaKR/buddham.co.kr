import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormGroup, FormGroupDirective, NonNullableFormBuilder } from '@angular/forms';
import { GlobalErrorStateMatcher } from '@app/core/classes/global-error-state-matcher';

@Injectable()
export abstract class BaseFormService {

  protected fb = inject(NonNullableFormBuilder);
  public readonly matcher = new GlobalErrorStateMatcher();

  // 1. 컨트롤 자체를 받거나 이름을 받도록 유연하게 대처
  private getControl(form: FormGroup, controlOrName: string | AbstractControl): AbstractControl | null {
    return typeof controlOrName === 'string' ? form.get(controlOrName) : controlOrName;
  }

  hasError(
    form: FormGroup,
    controlName: string | AbstractControl,
    error: string,
    directive?: FormGroupDirective | null): boolean {

    // const control = form.get(controlName);
    const control = this.getControl(form, controlName);

    if (!control) return false;
    return this.matcher.isErrorState(control, directive || null) && control.hasError(error);
  }

  hasAnyError(
    form: FormGroup,
    field: string,
    directive?: FormGroupDirective | null
  ): boolean {
    const control = form.get(field);
    if (!control) return false;

    // 부모인 BaseFormService의 macher 활용 또는 순정 기준 매칭
    return this.matcher.isErrorState(control, directive || null) && !!control.errors;
  }
}
