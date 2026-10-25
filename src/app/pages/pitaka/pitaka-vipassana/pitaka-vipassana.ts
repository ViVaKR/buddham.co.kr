import { Component, ChangeDetectionStrategy } from '@angular/core';
import { injectBaseContext } from '@app/core/contexts/base-context';
import { Paths } from '@app/data/menu-data';
import { BodyLayout } from '@app/layout/body-layout/body-layout';
import { TitleLayout } from '@app/layout/title-layout/title-layout';

@Component({
  selector: 'pitaka-vipassana',
  imports: [BodyLayout, TitleLayout],
  templateUrl: './pitaka-vipassana.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './pitaka-vipassana.scss',
})
export default class PitakaVipassana {
  title = Paths.Pitaka.ko;
  color = Paths.Pitaka.color;
  protected base = injectBaseContext();
}
