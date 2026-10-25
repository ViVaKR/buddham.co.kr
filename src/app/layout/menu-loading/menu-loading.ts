import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'menu-loading',
  imports: [],
  templateUrl: './menu-loading.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './menu-loading.scss',
})
export class MenuLoading {
  active = input<boolean>(false);
}
