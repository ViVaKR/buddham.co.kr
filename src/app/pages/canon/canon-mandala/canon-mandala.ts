import { Component, ChangeDetectionStrategy } from '@angular/core';
import { injectBaseContext } from '@app/core/contexts/base-context';
import { Paths } from '@app/data/menu-data';
import { BodyLayout } from '@app/layout/body-layout/body-layout';
import { TitleLayout } from '@app/layout/title-layout/title-layout';

@Component({
  selector: 'canon-mandala',
  imports: [BodyLayout, TitleLayout],
  templateUrl: './canon-mandala.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './canon-mandala.scss',
})
export default class CanonMandala {
  title = Paths.Canon.ko;
  color = Paths.Canon.color;
  protected base = injectBaseContext();
}
