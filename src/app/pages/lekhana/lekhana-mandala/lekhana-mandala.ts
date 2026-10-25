import { Component, ChangeDetectionStrategy } from '@angular/core';
import { injectBaseContext } from '@app/core/contexts/base-context';
import { Paths } from '@app/data/menu-data';
import { BodyLayout } from '@app/layout/body-layout/body-layout';
import { TitleLayout } from '@app/layout/title-layout/title-layout';

@Component({
  selector: 'lekhana-mandala',
  imports: [BodyLayout, TitleLayout],
  templateUrl: './lekhana-mandala.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './lekhana-mandala.scss',
})
export default class LekhanaMandala {
  title = Paths.Lekhana.ko;
  color = Paths.Lekhana.color;
  protected base = injectBaseContext();
}
