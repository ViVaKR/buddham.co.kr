import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { FontSelector } from '@app/layout/font-selector/font-selector';
import { FontSizeSelector } from '@app/layout/font-size-selector/font-size-selector';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';

// 스타일 변경 이벤트를 처리할 인터페이스 규격
export interface TextStyleConfig {
  font: string;
  size: string;
  lineSpace: number;
}

@Component({
  selector: 'text-style-selector',
  imports: [CommonModule, ...MATERIAL_COMMON, FontSelector, FontSizeSelector],
  templateUrl: './text-style-selector.html',
  styleUrl: './text-style-selector.scss',
})
export class TextStyleSelector {
  // 부모로부터 초기값 세팅 받기
  font = input.required<string>();
  size = input.required<string>();
  lineSpace = input.required<number>();

  // 통합된 스타일 변경 이벤트 딱 하나만 외부로 방출!
  styleChanged = output<TextStyleConfig>();
  resizeRequested = output<void>(); // textarea 리사이즈 트리거용

  lineSpaceOptions = [1.4, 1.6, 1.8, 2.0, 2.2, 2.5];

  onFontChanged(newFont: string) {
    this.styleChanged.emit({ font: newFont, size: this.size(), lineSpace: this.lineSpace() });
  }

  onFontSizeChanged(newSize: string) {
    this.styleChanged.emit({ font: this.font(), size: newSize, lineSpace: this.lineSpace() });
  }

  onChangeLineSpace(event: MatSelectChange<number>) {
    this.styleChanged.emit({ font: this.font(), size: this.size(), lineSpace: event.value });
    // 행높이가 바뀌면 textarea 높이도 재계산되어야 하므로 부모에게 알림
    this.resizeRequested.emit();
  }

  triggerResize() {
    this.resizeRequested.emit();
  }
}
