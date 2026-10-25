import { Component, ChangeDetectionStrategy } from '@angular/core';
import { injectBaseContext } from '@app/core/contexts/base-context';
import { Paths } from '@app/data/menu-data';
import { BodyLayout } from '@app/layout/body-layout/body-layout';
import { TitleLayout } from '@app/layout/title-layout/title-layout';

@Component({
  selector: 'sutra-karma',
  imports: [BodyLayout, TitleLayout],
  templateUrl: './sutra-karma.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sutra-karma.scss',
})
export default class SutraKarma {
  title = Paths.Sutra.ko;
  color = Paths.Sutra.color;
  protected base = injectBaseContext();
}
