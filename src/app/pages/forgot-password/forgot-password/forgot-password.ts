import { Component } from '@angular/core';
import MainLayout from '@layout/main-layout/main-layout';
import { BaseDirective } from '@directives/base.directive';

@Component({
  selector: 'forgot-password',
  imports: [MainLayout],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
  hostDirectives: [BaseDirective],
})
export default class ForgotPassword {}
