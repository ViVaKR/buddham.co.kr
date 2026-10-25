import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IClientInfoRequest } from '@app/core/interfaces/api/request/i-client-info.request';
import { IPublicIpRequest, IPublicIpText } from '@app/core/interfaces/api/request/i-public-ip.request';
import { BaseService } from '@app/core/services/base/base.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IpInfoService extends BaseService {


  public getPublicIpAddress = httpResource<IPublicIpText>(() => `${this.publicIp}/api/public-ip`);

  public getMyIpInfomation = httpResource<IClientInfoRequest>(() => `${this.clientInfo}/api/ip`);

  public getIpInfomation(ip: string): Observable<IClientInfoRequest> {
    return this.http.get<IClientInfoRequest>(`${this.clientInfo}/api/ip/${ip}`);
  }
}
