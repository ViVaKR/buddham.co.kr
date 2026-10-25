import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { BaseDirective } from '@app/core/directives/base.directive';
import { IPetal } from '@app/core/interfaces/ui/i-petal';
import { IpInfoService } from '@app/core/services/info/ip-info.service';
import { FOLDER_CONFIG } from '@app/data/folder-config';
import { Paths } from '@app/data/menu-data';
import { HomeService } from '@app/pages/home/services/home-service';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { delay, takeWhile, tap, timer } from 'rxjs';
import katex from 'katex';

@Component({
  selector: 'home',
  imports: [CommonModule, ...MATERIAL_COMMON],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  hostDirectives: [{ directive: BaseDirective }],
})
export default class Home {
  private readonly ipinfoService = inject(IpInfoService);
  private readonly router = inject(Router);
  private readonly quotesService = inject(HomeService);
  readonly folders = FOLDER_CONFIG;

  readonly messages = [
    '소리에 놀라지 않는 사자처럼',
    '그물에 걸리지 않는 바람처럼',
    '진흙에 더러워지지 않는 연꽃처럼',
    '무소의 뿔처럼 혼자서 가라',
  ];

  readonly guestWelcomes = [
    '평온한 마음으로 머무소서',
    '지친 마음, 잠시 쉬어가세요',
    '당신의 발걸음에 평화가 있기를',
    '맑은 인연으로 만나 반갑습니다',
    '이곳에서의 시간이 좋은 인연이 되길',
  ];

  readonly mathContainer = viewChild<ElementRef<HTMLElement>>('mathContainer');
  expression =
    'R_{\\mu\\nu} - \\frac{1}{2}Rg_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4}T_{\\mu\\nu}';
  currentWelcome = signal(
    this.guestWelcomes[Math.floor(Math.random() * this.guestWelcomes.length)],
  );

  isVisible = signal(true);
  currentIndex = signal(0);
  currentIdx = signal(0);
  petals = signal<IPetal[]>([]);
  isQuoteGlowing = signal(false);
  message = signal<Array<{ key: string; char: string; delay: number }> | null>(null);

  // 3. Computed 활용 (반응형 로직 최적화)
  quotes = this.quotesService.getAllQuotes();
  currentQuote = computed(() => this.quotes[this.currentIndex()]);

  publicIp = computed(() => this.ipinfoService.getPublicIpAddress.value());

  fontSize = computed(() => (this.currentIdx() === 3 ? '5rem' : '4rem'));
  enterActive = signal(false);
  leaveActive = signal(false);

  private history: number[] = [];
  private historySize = 3;

  constructor() {

    this.initMessageTimer();
    this.initQuoteTimer();
    effect(() => {
      const el = this.mathContainer()?.nativeElement;
      if (el) {
        el.innerHTML = '';
        katex.render(this.expression, el, {
          displayMode: true,
          throwOnError: false,
        });
      }
    });
  }

  // 메시지 타이머 (메소드로 분리해서 가독성 업!)
  private initMessageTimer() {
    timer(1000, 5000)
      .pipe(
        takeUntilDestroyed(),
        takeWhile((i) => i < this.messages.length),
        tap((i) => {
          // 1. 기존 메시지를 비워 DOM을 완전히 제거 (애니메이션 초기화)
          this.message.set(null);

          // 2. 아주 짧은 딜레이 후 새 문장을 구성
          setTimeout(() => {
            this.currentIdx.set(i);
            const text = this.messages[i];
            const result = Array.from(text).map((c, idx) => ({
              // idx를 포함한 유니크 키를 생성하여 Angular가 확실히 새 요소로 인식하게 함
              key: `char-${i}-${idx}-${crypto.randomUUID().slice(0, 8)}`,
              char: c === ' ' ? '\u00A0' : c,
              delay: idx * 100 + Math.random() * 80,
            }));
            this.message.set(result);
          }, 50); // 50ms 정도의 여유를 줍니다.
        }),
      )
      .subscribe();
  }

  private initQuoteTimer() {
    timer(5000, 8000)
      .pipe(
        tap(() => {
          this.isVisible.set(false);
          this.isQuoteGlowing.set(false); // 광채 끄기
        }),
        delay(2000),
        tap(() => {
          this.currentIndex.set(this.pickRandomIndex(this.quotes.length));
          this.isVisible.set(true);
          this.isQuoteGlowing.set(true); // 새 법문이 나올 때 광채 켜기

          // 1초 뒤에 광채를 서서히 줄임
          setTimeout(() => this.isQuoteGlowing.set(false), 1000);
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  private pickRandomIndex(len: number): number {
    let idx: number;
    do {
      idx = Math.floor(Math.random() * len);
    } while (this.history.includes(idx));

    this.history = [...this.history.slice(-(this.historySize - 1)), idx];
    return idx;
  }
  // 마우스 이동 이벤트 핸들러
  onMouseMove(event: MouseEvent) {
    // 너무 많이 생성되지 않도록 확률적으로 생성 (30% 확률)
    if (Math.random() > 0.3) return;

    const newPetal: IPetal = {
      id: crypto.randomUUID(),
      x: event.clientX,
      y: event.clientY,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.8,
      delay: Math.random() * 200,
    };

    // 새 잎 추가
    this.petals.update((p) => [...p, newPetal]);

    // 2초 뒤에 제거 (애니메이션 종료 후)
    setTimeout(() => {
      this.petals.update((p) => p.filter((item) => item.id !== newPetal.id));
    }, 2000);
  }
  goTo(uri?: string) {
    this.router.navigate([`${uri ?? Paths.Lekhana.url}`]);
  }
}
