import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BodyLayout } from '@layout/body-layout/body-layout';
import { TitleLayout } from '@layout/title-layout/title-layout';
import { Paths } from '@data/menu-data';

@Component({
  selector: 'guide-vipassana',
  imports: [BodyLayout, TitleLayout],
  templateUrl: './guide-vipassana.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './guide-vipassana.scss',
})
export default class GuideVipassana {
  title = Paths.Guide.ko;
  color = Paths.Guide.color;
}
