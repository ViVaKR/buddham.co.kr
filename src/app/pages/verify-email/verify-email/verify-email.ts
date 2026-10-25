import { Component } from '@angular/core';
import MainLayout from '@layout/main-layout/main-layout';
import { BaseDirective } from '@directives/base.directive';

@Component({
  selector: 'verify-email',
  imports: [MainLayout],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss',
  hostDirectives: [BaseDirective],
})
export default class VerifyEmail {}
