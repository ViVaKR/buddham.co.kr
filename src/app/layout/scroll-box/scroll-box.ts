import { CommonModule, ViewportScroller } from '@angular/common';
import {
  Component,
  DOCUMENT,
  inject,
  Input,
  input,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { debounceTime, filter, fromEvent } from 'rxjs';

@Component({
  selector: 'scroll-box',
  imports: [CommonModule, ...MATERIAL_COMMON],
  templateUrl: './scroll-box.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './scroll-box.scss',
})
export class ScrollBox {
  @Input() scrollTarget?: HTMLElement;

  document = inject(DOCUMENT);
  viewportScroller = inject(ViewportScroller);

  // 자동 스크롤 상태 관리
  private autoScrollInterval?: number;
  isAutoScrolling = signal(false);

  // 기본값: 초당 50픽셀
  // 스크롤 속도, 사용자 설정 가능한 스크롤 속도 (픽셀/초)
  scrollSpeed = signal(50);

  // 컴포넌트 표시 여부
  isVisible = signal(true);
  private hideTimeout?: number;
  private readonly HIDE_DELAY = 3_000; // 3초 후 숨김
  private subscriptions: any[] = [];

  constructor() {
    this.setupMouseMoveListener();
    this.setupKeyboardListener();
  }

  private setupMouseMoveListener(): void {
    // 마우스 이동 감지 (debounce로 성능 최적화)
    const mouseMove$ = fromEvent<MouseEvent>(this.document, 'mousemove').pipe(
      debounceTime(100), // 100ms 마다 체크
    );

    const subscription = mouseMove$.subscribe(() => {
      this.showAndResetTimer();
    });

    this.subscriptions.push(subscription);
  }

  private setupKeyboardListener(): void {
    // 키보드 이벤트 감지 (타이핑 제외)
    const keydown$ = fromEvent<KeyboardEvent>(this.document, 'keydown').pipe(
      filter((event) => {
        // 타이핑 관련 키는 제외
        const typingKeys = [
          'a',
          'b',
          'c',
          'd',
          'e',
          'f',
          'g',
          'h',
          'i',
          'j',
          'k',
          'l',
          'm',
          'n',
          'o',
          'p',
          'q',
          'r',
          's',
          't',
          'u',
          'v',
          'w',
          'x',
          'y',
          'z',
          '0',
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          'Backspace',
          'Delete',
          'Enter',
          'Tab',
          'Space',
        ];

        // input, textarea에서의 타이핑은 무시
        const target = event.target as HTMLElement;
        const isTypingElement =
          target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

        if (isTypingElement && typingKeys.includes(event.key)) {
          return false; // 타이핑 중에는 표시하지 않음
        }

        // 네비게이션 키만 감지 (화살표, PageUp/Down, Home/End 등)
        const navigationKeys = [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'PageUp',
          'PageDown',
          'Home',
          'End',
        ];

        return navigationKeys.includes(event.key);
      }),
      debounceTime(100),
    );

    const subscription = keydown$.subscribe(() => {
      this.showAndResetTimer();
    });

    this.subscriptions.push(subscription);
  }

  private showAndResetTimer(): void {
    // 컴포넌트 표시
    this.isVisible.set(true);

    // 기존 타이머 제거
    this.clearHideTimeout();

    // 새 타이머 설정
    this.hideTimeout = window.setTimeout(() => {
      this.isVisible.set(false);
    }, this.HIDE_DELAY);
  }

  private clearHideTimeout(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }
  }

  scrollToTopAngular(): void {
    this.stopAutoScroll();

    if (this.scrollTarget) {
      this.scrollTarget.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.viewportScroller.scrollToPosition([0, 0], { behavior: 'smooth' });
    }
  }

  scrollToBottomAngular(): void {
    this.stopAutoScroll();

    if (this.scrollTarget) {
      this.scrollTarget.scrollTo({
        top: this.scrollTarget.scrollHeight,
        behavior: 'smooth',
      });
    } else {
      const height = this.document.body.scrollHeight;
      this.viewportScroller.scrollToPosition([0, height], { behavior: 'smooth' });
    }
  }

  scrollToAnchor(anchorId: string): void {
    this.stopAutoScroll();
    this.viewportScroller.scrollToAnchor(anchorId, {
      behavior: 'smooth',
    });
  }

  // 방법 1: requestAnimationFrame 사용 (가장 부드러움, 추천!)
  scrollForSlowRead(): void {
    if (this.isAutoScrolling()) {
      this.stopAutoScroll();
      return;
    }

    this.isAutoScrolling.set(true);
    let lastTimestamp = 0;

    const scroll = (timestamp: number) => {
      if (!this.isAutoScrolling()) return;

      if (lastTimestamp) {
        const deltaTime = timestamp - lastTimestamp;
        const scrollAmount = (this.scrollSpeed() * deltaTime) / 1000;

        // 기준이 엘리먼트인지 windows 인지 판단
        if (this.scrollTarget) {
          this.scrollTarget.scrollTop += scrollAmount;

          // 끝 도달 확인
          const isBottom =
            this.scrollTarget.scrollTop + this.scrollTarget.clientHeight >=
            this.scrollTarget.scrollHeight - 10;
          if (isBottom) {
            this.stopAutoScroll();
            return;
          }
        } else {
          // 'smooth'는 사용하지 않음 (RAF로 직접 제어)
          window.scrollBy({ top: scrollAmount, behavior: 'instant' });

          // 페이지 끝에 도달했는지 확인
          const isBottom =
            window.innerHeight + window.scrollY >= this.document.body.scrollHeight - 10;
          if (isBottom) {
            this.stopAutoScroll();
            return;
          }
        }
      }
      lastTimestamp = timestamp;
      this.autoScrollInterval = requestAnimationFrame(scroll) as unknown as number;
    };

    this.autoScrollInterval = requestAnimationFrame(scroll) as unknown as number;
  }

  // 방법 2: setInterval 사용 (더 간단하지만 덜 부드러움)
  scrollForSlowReadInterval(): void {
    if (this.isAutoScrolling()) {
      this.stopAutoScroll();
      return;
    }

    this.isAutoScrolling.set(true);
    const fps = 60;
    const scrollPerFrame = this.scrollSpeed() / fps;

    this.autoScrollInterval = window.setInterval(() => {
      const isBottom = window.innerHeight + window.scrollY >= this.document.body.scrollHeight - 10;

      if (isBottom) {
        this.stopAutoScroll();
        return;
      }

      window.scrollBy({
        top: scrollPerFrame,
        behavior: 'instant',
      });
    }, 1000 / fps);
  }

  stopAutoScroll(): void {
    if (this.autoScrollInterval) {
      if (typeof this.autoScrollInterval === 'number') {
        // requestAnimationFrame 취소
        cancelAnimationFrame(this.autoScrollInterval);
      } else {
        // setInterval 취소
        clearInterval(this.autoScrollInterval);
      }
      this.autoScrollInterval = undefined;
    }
    this.isAutoScrolling.set(false);
  }

  // 속도 조절 메서드
  adjustSpeed(speed: number): void {
    this.scrollSpeed.set(speed);
    // 스크롤 중이면 재시작
    if (this.isAutoScrolling()) {
      this.stopAutoScroll();
      setTimeout(() => this.scrollForSlowRead(), 100);
    }
  }

  // 속도 프리셋
  setSpeedPreset(preset: 'slow' | 'medium' | 'fast'): void {
    const speeds = {
      slow: 30,
      medium: 50,
      fast: 80,
    };
    this.adjustSpeed(speeds[preset]);
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
  }
}
