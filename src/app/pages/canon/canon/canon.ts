import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BaseDirective } from '@app/core/directives/base.directive';
import MainLayout from '@layout/main-layout/main-layout';

@Component({
  selector: 'canon',
  imports: [MainLayout],
  templateUrl: './canon.html',
  styleUrl: './canon.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  hostDirectives: [BaseDirective],
})
export default class Canon {}
