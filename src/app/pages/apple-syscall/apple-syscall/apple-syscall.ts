import { Component } from '@angular/core';
import MainLayout from "@app/layout/main-layout/main-layout";
import { BaseDirective } from '@app/core/directives/base.directive';

@Component({
  selector: 'apple-syscall',
  imports: [MainLayout],
  templateUrl: './apple-syscall.html',
  styleUrl: './apple-syscall.scss',
  hostDirectives: [BaseDirective],
})
export default class AppleSyscall { }
