import { Directive, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IFormConfig } from '@app/core/interfaces/form/i-form.config';
import { BaseNavigatorService } from '@app/core/services/base/base-navigator.service';
import { AlertService } from '@app/core/services/ui/alert.service';
import { LoaderService } from '@app/core/services/ui/loader.service';

@Directive()
export abstract class AsyncFormDirective<TData, TPayload> {
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly navigator = inject(BaseNavigatorService);
  protected readonly loader = inject(LoaderService);
  protected readonly alertService = inject(AlertService);
  abstract onSubmit(event: MouseEvent): Promise<void>;

  protected abstract buildConfig(
    data: TData | null,
    isEdit: boolean
  ): IFormConfig<TPayload>;

  protected async loadAndInit<T>(
    id: string | number | undefined,
    fetcher: (id: string | number) => Promise<T>) {
    const isEdit = !!id;
    const data = isEdit ? await fetcher(id!) : null;
    return { data, isEdit };
  }
}
