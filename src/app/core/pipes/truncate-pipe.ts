import { Pipe, PipeTransform } from '@angular/core';
export type TruncateMode = 'default' | 'word' | 'middle';

@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    limit: number = 15,
    mode: TruncateMode = 'default',
    suffix: string = '...'
  ): string {
    if (!value) return '';
    if (value.length <= limit) return value;

    switch (mode) {
      case 'word': // 1. 단어 단위로 예쁘게 자르기
        const lastSpace = value.slice(0, limit).lastIndexOf(' ');
        return value.slice(0, lastSpace > 0 ? lastSpace : limit).trimEnd() + suffix;

      case 'middle': // 2. 중간 생략 (예: "VeryLong...File.pdf")
        const head = Math.ceil(limit / 2);
        const tail = Math.floor(limit / 2);
        return value.slice(0, head).trimEnd() + suffix + value.slice(-tail).trimStart();

      case 'default':
      default: // 3. 사령관님의 기존 방식 (단순 절단)
        return value.slice(0, limit).trimEnd() + suffix;
    }
  }
}
