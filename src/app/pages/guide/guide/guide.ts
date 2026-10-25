import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BaseDirective } from '@app/core/directives/base.directive';
import MainLayout from '@layout/main-layout/main-layout';

@Component({
  selector: 'guide',
  imports: [MainLayout],
  templateUrl: './guide.html',
  styleUrl: './guide.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  hostDirectives: [BaseDirective],
})
export default class Guide {}
