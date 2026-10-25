import { Component } from '@angular/core';
import MainLayout from '@layout/main-layout/main-layout';
import { BaseDirective } from '@directives/base.directive';

@Component({
  selector: 'reset-password',
  imports: [MainLayout],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
  hostDirectives: [BaseDirective],
})
export default class ResetPassword {}
