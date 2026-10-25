import { CommonModule } from '@angular/common';
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { injectBaseContext } from '@app/core/contexts/base-context';
import { Icons } from '@app/shared/constants/icon.constants';

@Component({
  selector: 'title-layout',
  imports: [CommonModule, MatIcon],
  templateUrl: './title-layout.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './title-layout.scss',
})
export class TitleLayout {
  title = input<string | null>(null);
  color = input<string | null>(null);
  icon = input<string | null>(Icons.NaturePeople);
  protected base = injectBaseContext();
}
