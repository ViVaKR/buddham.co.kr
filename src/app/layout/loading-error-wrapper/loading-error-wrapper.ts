import { Component, input, isDevMode, ChangeDetectionStrategy } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ErrorState } from '../error-state/error-state';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IPagedServiceConstraint } from '@app/core/interfaces/ui/i-paged-service-constraint';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'loading-error-wrapper',
  imports: [CommonModule, RouterLink, MatIcon, ErrorState, MatButton],
  templateUrl: './loading-error-wrapper.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './loading-error-wrapper.scss',
})
export class LoadingErrorWrapper {
  service = input.required<IPagedServiceConstraint>();
  isDev = isDevMode();
}
