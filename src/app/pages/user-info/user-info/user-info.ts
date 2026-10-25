import { Component } from '@angular/core';
import MainLayout from '@layout/main-layout/main-layout';
import { BaseDirective } from '@directives/base.directive';

@Component({
  selector: 'user-info',
  imports: [MainLayout],
  templateUrl: './user-info.html',
  styleUrl: './user-info.scss',
  hostDirectives: [BaseDirective],
})
export default class UserInfo {}
