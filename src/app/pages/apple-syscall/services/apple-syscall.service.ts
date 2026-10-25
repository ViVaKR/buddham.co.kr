import { Service } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IAppleSyscallPayload, IAppleSyscallView } from '../interfaces/i-apple-syscall';
import { IResponse } from '@app/core/interfaces/api/i-response';
import { BaseService } from '@app/core/services/base/base.service';

@Service()
export class AppleSyscallService extends BaseService {

  // ── READ ─────────────────────────────────
  list = httpResource<IAppleSyscallView[]>( () => `${this.apiUrl}`);

  // ── CREATE / UPDATE ──────────────────────
  async upsert(payload: IAppleSyscallPayload, id?: number): Promise<IResponse> {
    const res = id
      ? await firstValueFrom(this.http.put<IResponse>(`${this.apiUrl}/Update/${id}`, payload))
      : await firstValueFrom(this.http.post<IResponse>(`${this.apiUrl}/Create`, payload));
    if (res.isSuccess) this.list.reload();
    return res;
  }

  // ── DELETE ───────────────────────────────
  async delete(id: number): Promise<IResponse> {
    const res = await firstValueFrom(
      this.http.delete<IResponse>(`${this.apiUrl}/Delete/${id}`)
    );
    if (res.isSuccess) this.list.reload();
    return res;
  }
}
