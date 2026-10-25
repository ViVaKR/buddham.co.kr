import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';

@Component({
  selector: 'font-size-selector',
  imports: [
    CommonModule,
    ...MATERIAL_COMMON
  ],
  templateUrl: './font-size-selector.html',
  styleUrl: './font-size-selector.scss',
})
export class FontSizeSelector {

  selectedSize = input<string>('20px');
  minSize = input<number>(9);
  maxSize = input<number>(72);

  fontSizeChanged = output<string>();
  resizeRequested = output<void>();

  fontOptions = (min: number, max: number) =>
    [...Array(max - min + 1).keys()].map(i => `${i + min}px`);

  onSizeChange(value: string) {
    this.fontSizeChanged.emit(value);
    this.resizeRequested.emit();
  }
}
