import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseDirective } from '@app/core/directives/base.directive';
import MainLayout from '@layout/main-layout/main-layout';

@Component({
  imports: [MainLayout],
  selector: 'chat',
  styleUrl: './chat.scss',
  templateUrl: './chat.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  hostDirectives: [BaseDirective]
})
export default class Chat { }
