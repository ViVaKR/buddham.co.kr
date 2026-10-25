import { Component, ChangeDetectionStrategy } from '@angular/core';
import { injectBaseContext } from '@app/core/contexts/base-context';
import { Paths } from '@app/data/menu-data';
import { BodyLayout } from '@app/layout/body-layout/body-layout';
import { TitleLayout } from '@app/layout/title-layout/title-layout';

@Component({
  selector: 'pitaka-samsara',
  imports: [BodyLayout, TitleLayout],
  templateUrl: './pitaka-samsara.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './pitaka-samsara.scss',
})
export default class PitakaSamsara {
  title = Paths.Pitaka.ko;
  color = Paths.Pitaka.color;
  protected base = injectBaseContext();
}
