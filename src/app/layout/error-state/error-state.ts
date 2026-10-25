import { CommonModule } from '@angular/common';
import { Component, inject, output, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';

@Component({
  selector: 'error-state',
  imports: [CommonModule, ...MATERIAL_COMMON],
  templateUrl: './error-state.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './error-state.scss',
})
export class ErrorState {
  private router = inject(Router);
  public retry = output<void>();

  onRetry() {
    this.retry.emit();
  }

  reloadCurrentRoute() {
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([this.router.url]));
  }
}
