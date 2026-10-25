import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'loading-state',
  imports: [MatProgressSpinner],
  templateUrl: './loading-state.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './loading-state.scss',
})
export class LoadingState {}
