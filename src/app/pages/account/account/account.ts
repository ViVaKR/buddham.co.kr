import { Component } from '@angular/core';
import { BaseDirective } from '@app/core/directives/base.directive';
import MainLayout from '@layout/main-layout/main-layout';

@Component({
  selector: 'account',
  imports: [MainLayout],
  templateUrl: './account.html',
  styleUrl: './account.scss',
  hostDirectives: [BaseDirective],
})
export default class Account { }
