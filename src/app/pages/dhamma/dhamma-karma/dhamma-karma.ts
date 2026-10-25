import { Component, ChangeDetectionStrategy } from '@angular/core';
import { injectBaseContext } from '@app/core/contexts/base-context';
import { Paths } from '@app/data/menu-data';
import { BodyLayout } from '@app/layout/body-layout/body-layout';
import { TitleLayout } from '@app/layout/title-layout/title-layout';

@Component({
  selector: 'dhamma-karma',
  imports: [BodyLayout, TitleLayout],
  templateUrl: './dhamma-karma.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dhamma-karma.scss',
})
export default class DhammaKarma {
  title = Paths.Dhamma.ko;
  color = Paths.Dhamma.color;
  protected base = injectBaseContext();
}
