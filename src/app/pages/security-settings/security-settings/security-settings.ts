import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BaseDirective } from '@app/core/directives/base.directive';
import MainLayout from '@layout/main-layout/main-layout';

@Component({
  selector: 'security-settings',
  imports: [MainLayout],
  templateUrl: './security-settings.html',
  styleUrl: './security-settings.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  hostDirectives: [{ directive: BaseDirective }],
})
export default class SecuritySettings {}
