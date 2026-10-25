import { CommonModule } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { injectBaseContext } from '@app/core/contexts/base-context';
import { BaseFormDirective } from '@app/core/directives/base-form.directive';
import { ISignUpModel } from '@app/core/interfaces/api/request/i-sign-up.request';
import { FormControlsOf, GenericFormService } from '@app/core/services/form/generic-form.service';
import { Paths } from '@app/data/menu-data';
import { BodyLayout } from '@app/layout/body-layout/body-layout';
import { TitleLayout } from '@app/layout/title-layout/title-layout';
import { createSignUpFormConfig } from '@app/pages/sign-up/services/sign-up-karma.config';
import { SignUpKarmaService } from '@app/pages/sign-up/services/sign-up-karma.service';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';

@Component({
  selector: 'sign-up-karma',
  imports: [BodyLayout, TitleLayout, CommonModule, ...MATERIAL_COMMON],
  templateUrl: './sign-up-karma.html',
  styleUrl: './sign-up-karma.scss',
})
export default class SignUpKarma extends BaseFormDirective {
  readonly base = injectBaseContext();
  hidePassword = signal(true);

  private formDirective = viewChild<FormGroupDirective>('formDirective');

  private fbService = inject(GenericFormService);
  private command = inject(SignUpKarmaService);
  readonly matcher = this.fbService.matcher;

  private readonly formConfig = createSignUpFormConfig();

  form: FormGroup<FormControlsOf<ISignUpModel>> = this.fbService.build(this.formConfig);

  /** 템플릿에서 간결하게 컨트롤 전원에 접근하기 위한 단일 포털 객체 */
  get ctrl() {
    return this.form.controls;
  }

  togglePassword(event: MouseEvent) {
    event.preventDefault();
    this.hidePassword.update((v) => !v);
  }

  // 단일 에러 검증이 필요 없다면 제거해도 좋으나, 혹시 몰라 살려둔 정밀 매칭기
  hasError(field: keyof ISignUpModel, error: string): boolean {
    return this.fbService.hasError(this.form, field as string, error, this.formDirective());
  }

  /** 통합 에러 감지기 (어떤 에러든 매칭 타이밍이 맞으면 true) */
  hasAnyError(field: keyof ISignUpModel): boolean {
    return this.fbService.hasAnyError(this.form, field as string, this.formDirective());
  }

  /** 한글 에러 번역기 (FormDirective 상태 연동으로 싱크 100% 보장) */
  errorMessage(field: keyof ISignUpModel): string {
    return this.fbService.getErrorMessage(this.form, field as string, this.formDirective());
  }

  /** 폼 그룹 레벨 공통 에러 메시지 번역기 (비밀번호 불일치 등) */
  getFormErrorMessage(errorKey: string): string {
    return this.fbService.getFormErrorMessage(this.form, errorKey);
  }

  isPending(field: string): boolean {
    return this.fbService.isPending(this.form, field);
  }

  goToLogin() {
    this.navigator.to([Paths.SignIn.url]);
  }

  onReset() {
    this.fbService.reset(this.form, {}, this.formConfig);
  }

  async onSubmit(event: MouseEvent): Promise<void> {
    event.preventDefault();
    this.fbService.markAllTouched(this.form);
    await this.command.execute(this.form);
  }
}
