import { DestroyRef, Directive, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';
import { fromEvent, map } from 'rxjs';

@Directive({
  selector: '[onlyEnglishDirective]',
  standalone: true
})
export class OnlyEnglishDirective implements OnInit {

  private el = inject(ElementRef);

  // Form 없이 쓸 때를 대비한 안전장치
  private ngControl = inject(NgControl, { optional: true });
  private destroyRef = inject(DestroyRef);
  ngOnInit(): void {
    // 1. input 엘리먼트의 'input' 이벤트를 RxJS 스트림으로 전환
    fromEvent<InputEvent>(this.el.nativeElement, 'input')
      .pipe(
        // 2. 입력된 value 추출 및 영문 제외 문자 제거 (가공)
        map(() => (this.el.nativeElement.value as string).replace(/[^a-zA-Z]/g, '')),
        // 3. 디렉티브가 파괴될 때 구독을 자동으로 해제 (메모리 누수 방지 - Angular 16+ 핵심 기능)
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((filteredValue) => {
        // 4. 실제 HTML <input> 화면의 값을 변경
        this.el.nativeElement.value = filteredValue;

        // 5. Angular Reactive Form 내부 상태(Value)도 완벽 동기화
        if (this.ngControl?.control) {
          this.ngControl.control.setValue(filteredValue, { emitEvent: false });
        }
      });
  }
}
