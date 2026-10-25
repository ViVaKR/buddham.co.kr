import { Component, ChangeDetectionStrategy } from '@angular/core';
import { injectBaseContext } from '@app/core/contexts/base-context';
import { Paths } from '@app/data/menu-data';
import { BodyLayout } from '@app/layout/body-layout/body-layout';
import { TitleLayout } from '@app/layout/title-layout/title-layout';

@Component({
  selector: 'lekhana-karma',
  imports: [BodyLayout, TitleLayout],
  templateUrl: './lekhana-karma.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './lekhana-karma.scss',
})
export default class LekhanaKarma {
  title = Paths.Lekhana.ko;
  color = Paths.Lekhana.color;
  protected base = injectBaseContext();
}
