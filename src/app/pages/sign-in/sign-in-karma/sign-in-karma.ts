import { CommonModule } from '@angular/common';
import {
  Component, effect, inject, signal,
  viewChild,
} from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { BaseFormDirective } from '@app/core/directives/base-form.directive';
import { BaseDirective } from '@app/core/directives/base.directive';
import { ISignInModel } from '@app/core/interfaces/api/request/i-sign-in.request';
import { FormControlsOf, GenericFormService } from '@app/core/services/form/generic-form.service';
import { IpInfoService } from '@app/core/services/info/ip-info.service';
import { Paths } from '@app/data/menu-data';
import { BodyLayout } from '@app/layout/body-layout/body-layout';
import { TitleLayout } from '@app/layout/title-layout/title-layout';
import { SignInKarmaService } from '@app/pages/sign-in/services/sign-in-karma.service';
import { createSignInFormConfig } from '@app/pages/sign-in/services/sign-in.config';
import { FORM_TEMPLATES } from '@app/shared/constants/form.constants';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';

@Component({
  selector: 'sign-in-karma',
  imports: [BodyLayout, TitleLayout, CommonModule, ...MATERIAL_COMMON],
  templateUrl: './sign-in-karma.html',
  styleUrl: './sign-in-karma.scss',
  hostDirectives: [BaseDirective],
})
export default class SignInKarma extends BaseFormDirective {
  readonly title = Paths.SignIn.ko;
  readonly color = 'text-amber-600';
  readonly base = inject(BaseDirective);
  readonly ipInfoService = inject(IpInfoService);
  hidePassword = signal(true);

  private formDirective = viewChild<FormGroupDirective>(FORM_TEMPLATES.DIRECTIVE_NAME);
  private fbService = inject(GenericFormService);
  private command = inject(SignInKarmaService);
  readonly matcher = this.fbService.matcher;
  private readonly formConfig = createSignInFormConfig();
  form: FormGroup<FormControlsOf<ISignInModel>> = this.fbService.build(this.formConfig);

  constructor() {
    super();
    effect(() => {
      const ip = this.ipInfoService.getPublicIpAddress.value()?.ip;
      if (ip)
        this.form.controls.ipAddress.setValue(ip);
    });
  }

  togglePassword(event: MouseEvent) {
    event.preventDefault();
    this.hidePassword.update((v) => !v);
  }

  hasError(field: keyof ISignInModel, error: string): boolean {
    return this.fbService.hasError(this.form, field as string, error, this.formDirective());
  }

  hasAnyError(field: keyof ISignInModel): boolean {
    return this.fbService.hasAnyError(this.form, field as string, this.formDirective());
  }

  errorMessage(field: keyof ISignInModel): string {
    return this.fbService.getErrorMessage(this.form, field as string);
  }

  isPending(field: string): boolean {
    return this.fbService.isPending(this.form, field);
  }

  goToSignUp() {
    this.navigator.to([Paths.SignUp.url]);
  }

  onReset() {
    this.fbService.reset(this.form, {}, this.formConfig);
  }

  override async onSubmit(event: MouseEvent): Promise<void> {
    event.preventDefault();
    console.log(this.form.value);
    this.fbService.markAllTouched(this.form);
    await this.command.execute(this.form);
  }
}
