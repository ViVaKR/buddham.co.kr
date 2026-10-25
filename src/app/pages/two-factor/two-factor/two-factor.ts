import { Component, ChangeDetectionStrategy } from '@angular/core';
import MainLayout from '@layout/main-layout/main-layout';
import { BaseDirective } from '@directives/base.directive';

@Component({
  selector: 'two-factor',
  imports: [MainLayout],
  templateUrl: './two-factor.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './two-factor.scss',
  hostDirectives: [BaseDirective],
})
export default class TwoFactor {}
