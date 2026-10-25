import { Component } from '@angular/core';
import { BaseDirective } from '@app/core/directives/base.directive';
import MainLayout from "@layout/main-layout/main-layout";

@Component({
  selector: 'auth',
  imports: [MainLayout],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
  hostDirectives: [BaseDirective]

})
export default class Auth { }
