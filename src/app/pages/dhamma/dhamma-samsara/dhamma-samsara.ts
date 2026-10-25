import { Component, ChangeDetectionStrategy } from '@angular/core';
import { injectBaseContext } from '@app/core/contexts/base-context';
import { Paths } from '@app/data/menu-data';
import { BodyLayout } from '@app/layout/body-layout/body-layout';
import { TitleLayout } from '@app/layout/title-layout/title-layout';

@Component({
  selector: 'dhamma-samsara',
  imports: [BodyLayout, TitleLayout],
  templateUrl: './dhamma-samsara.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dhamma-samsara.scss',
})
export default class DhammaSamsara {
  title = Paths.Dhamma.ko;
  color = Paths.Dhamma.color;
  protected base = injectBaseContext();
}
