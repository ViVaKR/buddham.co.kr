import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BaseDirective } from '@app/core/directives/base.directive';
import MainLayout from '@layout/main-layout/main-layout';

@Component({
  selector: 'lekhana',
  imports: [MainLayout],
  templateUrl: './lekhana.html',
  styleUrl: './lekhana.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  hostDirectives: [BaseDirective],
})
export default class Lekhana {}
