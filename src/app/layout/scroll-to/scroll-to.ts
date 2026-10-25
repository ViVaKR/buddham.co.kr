import { CommonModule, ViewportScroller } from '@angular/common';
import {
  Component,
  DOCUMENT,
  inject,
  input,
  signal,
  OnDestroy,
  DestroyRef,
} from '@angular/core';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { debounceTime, filter, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'scroll-to',
  imports: [CommonModule, ...MATERIAL_COMMON],
  templateUrl: './scroll-to.html',
  styleUrl: './scroll-to.scss',
})
export class ScrollTo implements OnDestroy {
  scrollTarget = input<HTMLElement>();

  document = inject(DOCUMENT);
  viewportScroller = inject(ViewportScroller);

  private destroyRef = inject(DestroyRef);

  // 자동 스크롤 상태 관리 (애니메이션 프레임 ID)
  private autoScrollInterval?: number;
  isAutoScrolling = signal(false);

  // 스크롤 속도 (픽셀/초)
  scrollSpeed = signal(50);

  // 컴포넌트 표시 여부 및 타이머
  isVisible = signal(true);
  private hideTimeout?: number;
  private readonly HIDE_DELAY = 3_000; // 3초 후 숨김

  // 소수점 스크롤 누적을 위한 내부 가상 위치 변수
  private virtualScrollTop = 0;

  constructor() {
    this.setupMouseMoveListener();
    this.setupKeyboardListener();
    this.setupUserScrollListener(); // 사용자의 수동 스크롤 감지기
  }
  /**
     * ✨ [우주급 대수술] 사용자가 자동 스크롤 중 마우스 휠이나 터치로 스크롤을 움직이면 
     * 가상 위치(virtualScrollTop)를 실시간으로 동기화하여 화면이 튀는 버그를 원천 차단하네!
     */
  private setupUserScrollListener(): void {
    // scrollTarget이 있으면 해당 컨테이너, 없으면 window(document)의 스크롤 감지
    const scrollSource$ = this.scrollTarget()
      ? fromEvent(this.scrollTarget()!, 'scroll')
      : fromEvent(this.document, 'scroll');

    scrollSource$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      // 사용자가 수동으로 스크롤바를 쥐고 흔들거나 휠을 돌릴 때 가상 변수를 동기화해 주어야 안 꼬이네!
      const currentActual = this.getCurrentScrollTop();

      // 자동 스크롤 중일 때 미세한 차이는 무시하고, 사용자가 휠을 크게 돌렸을 때만 동기화 (오차범위 2px)
      if (Math.abs(this.virtualScrollTop - currentActual) > 2) {
        this.virtualScrollTop = currentActual;
      }
    });
  }
  private setupKeyboardListener(): void {
    fromEvent<KeyboardEvent>(this.document, 'keydown').pipe(
      filter((event) => {
        const target = event.target as HTMLElement;
        // ✅ 타이핑 요소 체크 — 그대로 유지
        const isTypingElement =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable;

        // ✅ 정규식으로
        const isTypingKey = (key: string) => key.length === 1 || ['Backspace', 'Delete', 'Enter', 'Tab'].includes(key);

        if (isTypingElement && isTypingKey(event.key)) return false;

        // 네비게이션 키만 통과 
        const navigationKeys = [
          'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
          'PageUp', 'PageDown', 'Home', 'End',
        ];
        return navigationKeys.includes(event.key);
      }),
      debounceTime(100),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.showAndResetTimer());
  }

  private setupMouseMoveListener(): void {
    fromEvent<MouseEvent>(this.document, 'mousemove')
      .pipe(debounceTime(100),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(() => this.showAndResetTimer())
  }

  private showAndResetTimer(): void {
    this.isVisible.set(true);
    this.clearHideTimeout();
    this.hideTimeout = window.setTimeout(() => this.isVisible.set(false), this.HIDE_DELAY);
  }

  private clearHideTimeout(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }
  }

  /**
   * ✨ [핵심 개선] 현재 컨테이너나 윈도우의 '진짜 실제 스크롤 위치'를 가져오는 헬퍼 메서드
   */
  private getCurrentScrollTop(): number {
    const container = this.scrollTarget();
    if (container) {
      return container.scrollTop;
    }
    // 윈도우 스크롤 위치 (브라우저 호환성 확보)
    return (
      window.scrollY || this.document.documentElement.scrollTop || this.document.body.scrollTop
    );
  }

  /**
   * 1. 완전히 화면 최상단으로 (Window 기준 이동)
   */
  scrollToTopAngular(): void {
    this.stopAutoScroll();
    // 0에 집착하는 꼬임을 풀기 위해 실제 위치 스냅샷 동기화
    this.virtualScrollTop = 0;

    if (this.scrollTarget()) {
      this.scrollTarget()!.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * 5. 완전히 화면 최하단으로 (Window 기준 이동)
   */
  scrollToBottomAngular(): void {
    this.stopAutoScroll();

    if (this.scrollTarget()) {
      const container = this.scrollTarget()!;
      const maxScroll = container.scrollHeight - container.clientHeight;
      this.virtualScrollTop = maxScroll;
      container.scrollTo({ top: maxScroll, behavior: 'smooth' });
    } else {
      const maxWindowScroll = this.document.body.scrollHeight - window.innerHeight;
      this.virtualScrollTop = maxWindowScroll;
      window.scrollTo({ top: maxWindowScroll, behavior: 'smooth' });
    }
  }

  /**
   *  4. 테이블 컨테이너 상단/하단 앵커로 이동
   */
  scrollToAnchor(anchorId: string): void {
    this.stopAutoScroll();
    const element = this.document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // ✨ 이동 후 바뀐 현재 위치를 가상 변수에 즉시 반영해 두어야 다음 버튼들이 안 꼬이네!
      setTimeout(() => {
        this.virtualScrollTop = this.getCurrentScrollTop();
      }, 500); // 부드러운 이동이 끝나는 시점에 동기화
    }
  }

  /**
   * 3. [정중앙 버튼] 천천히 경전 읽기 기능 (requestAnimationFrame 최적화 버전)
   */
  scrollForSlowRead(): void {
    if (this.isAutoScrolling()) {
      this.stopAutoScroll();
      return;
    }

    this.isAutoScrolling.set(true);
    let lastTimestamp = 0;

    // ✨ [대수술] 중간 어디에 서 있든, 누르는 그 순간의 '실제 위치'를 가상 스크롤 시작점으로 잡음세!
    this.virtualScrollTop = this.getCurrentScrollTop();

    const scroll = (timestamp: number) => {
      if (!this.isAutoScrolling()) return;

      if (lastTimestamp) {
        const deltaTime = timestamp - lastTimestamp;
        // 프레임 경과 시간에 비례한 완벽한 스크롤 양 계산
        const scrollAmount = (this.scrollSpeed() * deltaTime) / 1000;

        const container = this.scrollTarget();

        if (container) {
          // 가상 변수에 더한 후 실제 엘리먼트에 주입 (소수점 누락 방지)
          this.virtualScrollTop += scrollAmount;
          container.scrollTop = this.virtualScrollTop;

          const maxScroll = container.scrollHeight - container.clientHeight;
          // 바닥 검증 (실제 돔이 바닥에 닿았거나 가상 위치가 초과했을 때)
          if (container.scrollTop >= maxScroll - 4 || this.virtualScrollTop >= maxScroll) {
            this.stopAutoScroll();
            return;
          }
        } else {
          // 윈도우 창 스크롤 제어
          this.virtualScrollTop += scrollAmount;
          window.scrollTo({ top: this.virtualScrollTop });

          const maxWindowScroll = this.document.body.scrollHeight - window.innerHeight;
          if (window.scrollY >= maxWindowScroll - 4 || this.virtualScrollTop >= maxWindowScroll) {
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

  /**
   * 자동 스크롤 정지 및 가상 변수 최종 동기화
   */
  stopAutoScroll(): void {
    if (this.autoScrollInterval) {
      cancelAnimationFrame(this.autoScrollInterval);
      this.autoScrollInterval = undefined;
    }
    this.isAutoScrolling.set(false);

    // 멈추는 순간의 실제 스크롤 값을 변수에 스냅샷으로 저장하네
    this.virtualScrollTop = this.getCurrentScrollTop();
  }

  // 속도 실시간 조절 (이제 스크롤을 껐다 켤 필요가 전혀 없네!)
  adjustSpeed(speed: number): void {
    this.scrollSpeed.set(speed);
  }

  setSpeedPreset(preset: 'slow' | 'medium' | 'fast'): void {
    const speeds = { slow: 25, medium: 50, fast: 90 };
    this.adjustSpeed(speeds[preset]);
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
    this.clearHideTimeout();
  }
}



/* 
key.length === 1 이 되는 것들
├── 'a' ~ 'z'      ✅
├── 'A' ~ 'Z'      ✅
├── '0' ~ '9'      ✅
├── '!', '@', '#'  ✅ 특수문자도!
├── '가', '나', '다' ✅ 한글도!
└── ' ' (스페이스)  ✅

key.length === 1 이 안되는 것들
├── 'ArrowUp'      ❌ → 네비게이션 키로 통과
├── 'Backspace'    ❌ → 별도 배열로 처리
├── 'Enter'        ❌ → 별도 배열로 처리
└── 'Control'      ❌ → 그냥 무시

*/