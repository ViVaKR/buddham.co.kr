import { Component, ChangeDetectionStrategy } from '@angular/core';
import { injectBaseContext } from '@app/core/contexts/base-context';
import { BaseDirective } from '@app/core/directives/base.directive';
import { Paths } from '@app/data/menu-data';
import MainLayout from '@layout/main-layout/main-layout';

@Component({
  selector: 'dhamma',
  imports: [MainLayout],
  templateUrl: './dhamma.html',
  styleUrl: './dhamma.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  hostDirectives: [BaseDirective],
})
export default class Dhamma {
  title = Paths.Canon.ko;
  color = Paths.Canon.color;
  protected base = injectBaseContext();
}
