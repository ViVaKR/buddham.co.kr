import { Component, inject, isDevMode, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_COMMON } from '@shared/imports/material-imports';
import { BaseFormDirective } from '@directives/base-form.directive';
import { Paths } from '@data/menu-data';
import { VerifyEmailService } from '@pages/verify-email/services/verify-email.service';
import { FormControlsOf, GenericFormService } from '@services/form/generic-form.service';
import { VerifyEmailCommand } from '@pages/verify-email/services/verify-email-command';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { FORM_TEMPLATES } from '@shared/constants/form.constants';
import { IVerifyEmailPayload } from '@pages/verify-email/interfaces/i-verify-email';
import { IResetPasswordPayload } from '@pages/reset-password/interfaces/i-reset-password';
import { createVerifyEmailConfig } from '@pages/verify-email/services/verify-email.config';
import { environment } from '@env/environment';
import { UserStore } from '@services/auth/user.store';
import { BodyLayout } from '@layout/body-layout/body-layout';

@Component({
  selector: 'verify-email-karma',
  imports: [CommonModule, ...MATERIAL_COMMON, BodyLayout],
  templateUrl: './verify-email-karma.html',
  styleUrl: './verify-email-karma.scss',
})
export default class VerifyEmailKarma extends BaseFormDirective {
  readonly title = Paths.VerifyEmail.ko;
  readonly color = Paths.VerifyEmail.color;
  readonly service = inject(VerifyEmailService);
  readonly fbService = inject(GenericFormService);
  private command = inject(VerifyEmailCommand);
  private userStore = inject(UserStore);
  readonly matcher = this.fbService.matcher;
  readonly replyUrl = isDevMode() ? environment.api.devReply : environment.api.reply;

  loading = this.command.loading;
  private formDirective = viewChild<FormGroupDirective>(FORM_TEMPLATES.DIRECTIVE_NAME);
  form!: FormGroup<FormControlsOf<IVerifyEmailPayload>>;

  ngOnInit() {
    const email = this.userStore.userEmail();
    if (!email) {
      this.alertService.openSheet([
        {
          title: '로그인 필요',
          content: '로그인 후 이용하여 주세요',
        },
      ]).then(r => console.log(r));
      this.navigator.to(Paths.SignIn.url);
      return;
    }
    const confirmUrl = `${this.replyUrl}/ConfirmEmail`;
    const config = createVerifyEmailConfig(email, confirmUrl);
    this.form = this.fbService.build(config);
  }
  hasError(field: keyof IResetPasswordPayload, error: string): boolean {
    return this.fbService.hasError(this.form, field as string, error, this.formDirective());
  }

  override async onSubmit(event: MouseEvent): Promise<void> {
    event.preventDefault();
    console.log(this.form.getRawValue());
    const result = await this.command.execute(this.form);
    if (result) {
      this.navigator.to(Paths.Home.url);
    }
  }
}
