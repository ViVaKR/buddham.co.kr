import { Component } from '@angular/core';
import { BaseDirective } from '@app/core/directives/base.directive';
import MainLayout from "@layout/main-layout/main-layout";
@Component({
  selector: 'dharma-chat',
  imports: [MainLayout],
  templateUrl: './dharma-chat.html',
  styleUrl: './dharma-chat.scss',
  hostDirectives: [BaseDirective],
})
export default class DharmaChat { }
