import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BaseNavigatorService } from '@app/core/services/base/base-navigator.service';
import { AlertService } from '@app/core/services/ui/alert.service';
import { LoaderService } from '@app/core/services/ui/loader.service';
import { environment } from '@env/environment';

@Injectable()
export abstract class BaseService {
  protected http = inject(HttpClient);
  protected apiUrl = environment.api.main;
  protected aiSession = environment.api.aiSession;
  protected chatUrl = environment.api.chat;
  protected publicIp = environment.api.publicIp;
  protected clientInfo = environment.api.clientInfo;
  protected alertService = inject(AlertService);
  public loading = signal<boolean>(false);
  protected loader = inject(LoaderService);
  protected navigator = inject(BaseNavigatorService);
}
