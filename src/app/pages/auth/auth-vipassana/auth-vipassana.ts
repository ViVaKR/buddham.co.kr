import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Paths } from '@app/data/menu-data';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { BodyLayout } from "@app/layout/body-layout/body-layout";
import { TitleLayout } from "@app/layout/title-layout/title-layout";
import { BaseService } from '@app/core/services/base/base.service';

@Component({
  selector: 'auth-vipassana',
  imports: [
    CommonModule,
    ...MATERIAL_COMMON,
    BodyLayout,
    TitleLayout
  ],
  templateUrl: './auth-vipassana.html',
  styleUrl: './auth-vipassana.scss',
})
export default class AuthVipassana extends BaseService {
  title = Paths.Auth.ko;
  color = Paths.Auth.color;

  id = input<string | undefined>(undefined);

  returnUrl = input<string | undefined>(undefined, {});

  readonly listUrl = computed(() => this.returnUrl() || Paths.Home.url);

  goToMandala() {
    this.navigator.to(this.returnUrl()!);
  }
}
