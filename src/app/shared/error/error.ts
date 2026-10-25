import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'error',
  imports: [],
  templateUrl: './error.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './error.scss',
})
export default class Error {
  private route = inject(ActivatedRoute);

  reason = this.route.snapshot.queryParams['reason'];

  get message(): string {
    switch (this.reason) {
      case 'initialization_timeout':
        return '앱 초기화 중 문제가 발생했습니다. 페이지를 새로고침해주세요.';
      default:
        return '알 수 없는 오류가 발생했습니다.';
    }
  }
}
