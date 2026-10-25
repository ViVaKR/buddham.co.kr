import { Component, computed, inject, isDevMode, viewChild } from '@angular/core';
import { BaseFormDirective } from '@directives/base-form.directive';
import { Paths } from '@data/menu-data';
import { ForgotPasswordService } from '@pages/forgot-password/services/forgot-password.service';
import { FormControlsOf, GenericFormService } from '@services/form/generic-form.service';
import { ForgotPasswordCommand } from '@pages/forgot-password/services/forgot-password-command';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { FORM_TEMPLATES } from '@shared/constants/form.constants';
import { createForgotPasswordConfig } from '@pages/forgot-password/services/forgot-password.config';
import { IForgotPasswordPayload } from '@pages/forgot-password/interfaces/i-forgot-password';
import { BodyLayout } from '@layout/body-layout/body-layout';
import { CommonModule } from '@angular/common';
import { MATERIAL_COMMON } from '@shared/imports/material-imports';
import { environment } from '@env/environment';

@Component({
  selector: 'forgot-password-karma',
  imports: [BodyLayout, CommonModule, ...MATERIAL_COMMON],
  templateUrl: './forgot-password-karma.html',
  styleUrl: './forgot-password-karma.scss',
})
export default class ForgotPasswordKarma extends BaseFormDirective {
  readonly title = Paths.ForgotPassword.ko;
  readonly color = Paths.ForgotPassword.color;

  readonly replyUrl = computed(() => {
    return isDevMode() ? environment.api.devResetPassword : environment.api.resetPassword;
  });

  readonly service = inject(ForgotPasswordService);
  private fbService = inject(GenericFormService);
  private command = inject(ForgotPasswordCommand);
  readonly matcher = this.fbService.matcher;
  private formDirective = viewChild<FormGroupDirective>(FORM_TEMPLATES.DIRECTIVE_NAME);
  private readonly formConfig = createForgotPasswordConfig(this.replyUrl());
  form: FormGroup<FormControlsOf<IForgotPasswordPayload>> = this.fbService.build(this.formConfig);

  hasError(field: keyof IForgotPasswordPayload, error: string): boolean {
    return this.fbService.hasError(this.form, field as string, error, this.formDirective());
  }

  override async onSubmit(event: MouseEvent): Promise<void> {
    event.preventDefault();
    const result = await this.command.execute(this.form);
    if (result) {
      this.alertService.openSheet([
        {
          title: '분실신고 완료!',
          content: '이메일을 확인하시어 비밀번호를 변경 하세요!',
        },
      ]);
      setTimeout(() => {
        this.navigator.to(Paths.Home.url);
      }, 1_000);
    }
  }
}
