import { Directive, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseNavigatorService } from '@app/core/services/base/base-navigator.service';
import { AlertService } from '@app/core/services/ui/alert.service';
import { LoaderService } from '@app/core/services/ui/loader.service';

@Directive()
export abstract class BaseFormDirective {
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly navigator = inject(BaseNavigatorService);
  protected readonly loader = inject(LoaderService);
  protected readonly alertService = inject(AlertService);
  abstract onSubmit(event: MouseEvent): Promise<void>;
}
