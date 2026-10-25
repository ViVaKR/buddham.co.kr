import { Component, inject, input, signal, viewChild } from '@angular/core';
import { BaseFormDirective } from '@directives/base-form.directive';
import { CommonModule } from '@angular/common';
import { MATERIAL_COMMON } from '@shared/imports/material-imports';
import { Paths } from '@data/menu-data';
import { ResetPasswordService } from '@pages/reset-password/services/reset-password.service';
import { FormControlsOf, GenericFormService } from '@services/form/generic-form.service';
import { FORM_TEMPLATES } from '@shared/constants/form.constants';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { IResetPasswordPayload } from '@pages/reset-password/interfaces/i-reset-password';
import { createResetPasswordConfig } from '@pages/reset-password/services/reset-password.config';
import { ResetPasswordCommand } from '@pages/reset-password/services/reset-password-command';

@Component({
  selector: 'reset-password-karma',
  imports: [CommonModule, ...MATERIAL_COMMON],
  templateUrl: './reset-password-karma.html',
  styleUrl: './reset-password-karma.scss',
})
export default class ResetPasswordKarma extends BaseFormDirective {
  readonly title = Paths.ResetPassword.ko;
  readonly color = Paths.ResetPassword.color;

  readonly service = inject(ResetPasswordService);
  readonly fbService = inject(GenericFormService);
  private command = inject(ResetPasswordCommand);
  readonly matcher = this.fbService.matcher;
  hidePassword = signal(true);
  private formDirective = viewChild<FormGroupDirective>(FORM_TEMPLATES.DIRECTIVE_NAME);

  readonly email = input<string | undefined>(undefined);
  readonly token = input<string | undefined>(undefined);

  form!: FormGroup<FormControlsOf<IResetPasswordPayload>>;

  ngOnInit() {
    // 인풋 바인딩이 끝난 시점이라 email(), token() 값이 확실히 존재함!
    const config = createResetPasswordConfig(this.email() ?? '', this.token() ?? '');
    this.form = this.fbService.build(config);
  }

  togglePassword(event: MouseEvent) {
    event.preventDefault();
    this.hidePassword.update((v) => !v);
  }

  hasError(field: keyof IResetPasswordPayload, error: string): boolean {
    return this.fbService.hasError(this.form, field as string, error, this.formDirective());
  }

  override async onSubmit(event: MouseEvent): Promise<void> {
    event.preventDefault();
    const result = await this.command.execute(this.form);
    if (result) {
      this.navigator.to(Paths.SignIn.url);
    }
  }
}
