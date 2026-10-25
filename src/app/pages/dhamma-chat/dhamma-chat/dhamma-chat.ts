import { Component } from '@angular/core';
import { BaseDirective } from '@app/core/directives/base.directive';
import MainLayout from '@app/layout/main-layout/main-layout';

@Component({
  imports: [MainLayout],
  selector: 'dhamma-chat',
  styleUrl: './dhamma-chat.scss',
  templateUrl: './dhamma-chat.html',
  hostDirectives: [BaseDirective]
})
export default class DhammaChat { }
