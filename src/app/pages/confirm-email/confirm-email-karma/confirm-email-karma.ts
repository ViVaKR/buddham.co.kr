import { Component, inject, viewChild, ChangeDetectionStrategy, input } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { BaseFormDirective } from '@app/core/directives/base-form.directive';
import { BaseDirective } from '@app/core/directives/base.directive';
import { FormControlsOf, GenericFormService } from '@app/core/services/form/generic-form.service';
import { Paths } from '@app/data/menu-data';
import { ConfirmEmailCommand } from '@pages/confirm-email/services/confirm-email-command';
import { createConfirmEmailConfig } from '@app/pages/confirm-email/services/confirm-email.config';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { BodyLayout } from '@layout/body-layout/body-layout';
import { IResetPasswordPayload } from '@pages/reset-password/interfaces/i-reset-password';
import { FORM_TEMPLATES } from '@shared/constants/form.constants';
import { IConfirmEmailPayload } from '@pages/confirm-email/interfaces/i-confirm-email';

@Component({
  selector: 'confirm-email-karma',
  imports: [...MATERIAL_COMMON, BodyLayout],
  templateUrl: './confirm-email-karma.html',
  styleUrl: './confirm-email-karma.scss',
  hostDirectives: [BaseDirective],
})
export default class ConfirmEmailKarma extends BaseFormDirective {
  title = Paths.ConfirmEmail.title;
  private formDirective = viewChild<FormGroupDirective>(FORM_TEMPLATES.DIRECTIVE_NAME);

  readonly email = input<string | undefined>(undefined);
  readonly token = input<string | undefined>(undefined);

  private fbService = inject(GenericFormService);
  private command = inject(ConfirmEmailCommand);
  readonly matcher = this.fbService.matcher;
  form!: FormGroup<FormControlsOf<IConfirmEmailPayload>>;

  loading = this.command.loading;
  ngOnInit() {
    const config = createConfirmEmailConfig(this.email() ?? '', this.token() ?? '');
    this.form = this.fbService.build(config);
  }
  hasError(field: keyof IResetPasswordPayload, error: string): boolean {
    return this.fbService.hasError(this.form, field as string, error, this.formDirective());
  }

  override async onSubmit(event: MouseEvent): Promise<void> {
    event.preventDefault();
    const result = await this.command.execute(this.form);
    if (result) {
      this.navigator.to(Paths.Account.url);
    }
  }
}
