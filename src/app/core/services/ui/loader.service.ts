import { computed, Service, signal } from '@angular/core';

@Service()
export class LoaderService {
  private _count = signal(0);
  loading = computed(() => this._count() > 0);

  show() {
    this._count.update((c) => c + 1);
  }
  hide() {
    this._count.update((c) => Math.max(0, c - 1));
  }
}
