import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { BaseService } from '@app/core/services/base/base.service';
import { Paths } from '@app/data/menu-data';
import { TitleLayout } from '@app/layout/title-layout/title-layout';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { BodyLayout } from "@app/layout/body-layout/body-layout";
import { Router } from '@angular/router';

@Component({
  selector: 'auth-mandala',
  imports: [
    CommonModule,
    ...MATERIAL_COMMON,
    TitleLayout,
    BodyLayout
  ],
  templateUrl: './auth-mandala.html',
  styleUrl: './auth-mandala.scss',
})
export default class AuthMandala extends BaseService {

  title = Paths.Auth.ko;
  color = Paths.Auth.color;

  readonly router = inject(Router);


  id = input<string | undefined>(undefined, {});


  goToVipassana(id: string) {
    this.navigator.withParams([`${Paths.Auth.url}/vipassana`, id], { returnUrl: [this.router.url] });
  }
}
