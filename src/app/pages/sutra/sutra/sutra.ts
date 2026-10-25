import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BaseDirective } from '@app/core/directives/base.directive';
import MainLayout from '@layout/main-layout/main-layout';

@Component({
  selector: 'sutra',
  imports: [MainLayout],
  templateUrl: './sutra.html',
  styleUrl: './sutra.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  hostDirectives: [BaseDirective],
})
export default class Sutra {}
