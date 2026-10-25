import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BaseDirective } from '@app/core/directives/base.directive';
import MainLayout from '@app/layout/main-layout/main-layout';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';

@Component({
  selector: 'sign-in',
  imports: [MainLayout, ...MATERIAL_COMMON],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  hostDirectives: [{ directive: BaseDirective }],
})
export default class SignIn { }
