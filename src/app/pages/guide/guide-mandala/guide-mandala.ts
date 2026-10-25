import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Paths } from '@app/data/menu-data';
import { BodyLayout } from "@app/layout/body-layout/body-layout";
import { TitleLayout } from "@app/layout/title-layout/title-layout";

@Component({
  selector: 'guide-mandala',
  imports: [BodyLayout, TitleLayout],
  templateUrl: './guide-mandala.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './guide-mandala.scss',
})
export default class GuideMandala {
  title = Paths.Guide.ko;
  color = Paths.Guide.color;
}
