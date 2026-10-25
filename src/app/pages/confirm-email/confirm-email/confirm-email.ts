import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BodyLayout } from '@layout/body-layout/body-layout';
import { TitleLayout } from '@layout/title-layout/title-layout';
import { Paths } from '@data/menu-data';
import { BaseDirective } from '@directives/base.directive';
import MainLayout from '@layout/main-layout/main-layout';

@Component({
  selector: 'confirm-email',
  imports: [MainLayout],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './confirm-email.html',
  styleUrl: './confirm-email.scss',
  hostDirectives: [BaseDirective],
})
export default class ConfirmEmail {
  readonly title = Paths.ConfirmEmail.ko;
  readonly color = Paths.ConfirmEmail.color;
}
