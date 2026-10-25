import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SignOutService } from '@app/core/services/auth/sign-out.service';
import { UserStore } from '@app/core/services/auth/user.store';
import { FormControlsOf, GenericFormService } from '@app/core/services/form/generic-form.service';
import { AlertService } from '@app/core/services/ui/alert.service';
import { Paths } from '@app/data/menu-data';
import { BodyLayout } from "@app/layout/body-layout/body-layout";
import { TitleLayout } from "@app/layout/title-layout/title-layout";
import { INirvanaPayload } from '@app/pages/nirvana/interfaces/i-nirvana';
import { createNirvanaFormConfig } from '@app/pages/nirvana/services/nirvana-karma.config';
import { NirvanaKarmaService } from '@app/pages/nirvana/services/nirvana-karma.service';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';

@Component({
  selector: 'nirvana',
  imports: [BodyLayout, TitleLayout,
    CommonModule,
    ...MATERIAL_COMMON
  ],
  templateUrl: './nirvana.html',
  styleUrl: './nirvana.scss',
})
export default class Nirvana {

  title = Paths.Nirvana.ko;
  color = Paths.Nirvana.color;
  hidePassword = signal(true);
  readonly userStore = inject(UserStore);
  readonly alertService = inject(AlertService);
  private readonly signOutService = inject(SignOutService);

  readonly userEmail = computed(() => this.userStore.userEmail());

  private fbService = inject(GenericFormService);
  private command = inject(NirvanaKarmaService);
  readonly matcher = this.fbService.matcher;

  private readonly formConfig = createNirvanaFormConfig();

  form: FormGroup<FormControlsOf<INirvanaPayload>> = this.fbService.build(this.formConfig);

  hasError(control: string, state: string) {
    const ctrl = this.form.get(control);
    return !!(ctrl?.hasError(state) && (ctrl.dirty || ctrl.touched));
  }

  togglePassword(event: Event) {
    event.preventDefault();
    this.hidePassword.update((value) => !value);
  }


  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    var confirm = await this.alertService.openConfirm("회원가입을 해제하시겠습니까?");
    if (!confirm) return;
    this.fbService.markAllTouched(this.form);
    const success = await this.command.execute(this.form);
    if (success) {
      this.signOutService.clearAll({ reload: true });
    }
  }
}

