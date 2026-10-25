import { Component, ChangeDetectionStrategy } from '@angular/core';
import MainLayout from '@layout/main-layout/main-layout';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { Paths } from '@app/data/menu-data';
import { BaseDirective } from '@app/core/directives/base.directive';
import { BaseFormService } from '@app/core/services/base/base-form.service';

@Component({
  selector: 'sign-up',
  imports: [MainLayout, ...MATERIAL_COMMON],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  hostDirectives: [{ directive: BaseDirective }],
})
export default class SignUp extends BaseFormService {
  title = Paths.SignUp.title;
}
