import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BaseService } from '@app/core/services/base/base.service';
import { Paths } from '@app/data/menu-data';
import { BodyLayout } from "@app/layout/body-layout/body-layout";
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { TitleLayout } from "@app/layout/title-layout/title-layout";

@Component({
  selector: 'auth-karma',
  imports: [BodyLayout,
    CommonModule,
    ...MATERIAL_COMMON,
    TitleLayout
  ],
  templateUrl: './auth-karma.html',
  styleUrl: './auth-karma.scss',
})
export default class AuthKarma extends BaseService {
  title = Paths.Auth.ko;
  color = Paths.Auth.color;
}
