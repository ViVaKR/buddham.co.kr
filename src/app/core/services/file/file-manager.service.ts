import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { computed, Service, signal } from '@angular/core';
import { PsStatus } from '@app/core/enums/ps-status';
import { IDataResponse } from '@app/core/interfaces/api/i-response';
import { IFileRequest } from '@app/core/interfaces/api/request/i-file.request';
import { IUploadProgress } from '@app/core/interfaces/ui/i-upload-progress';
import { BaseService } from '@app/core/services/base/base.service';
import { catchError, finalize, forkJoin, map, Observable, of, Subject, tap, throwError } from 'rxjs';

export type UploadChoice = 'avatar' | 'image' | 'file' | 'audio' | 'document' | 'video';

// ── 업로드 옵션 (관리자 targetUserId 포함) ──────────────────────────
export interface UploadOptions {
  onProgress?: (p: number) => void;
  targetUserId?: string; // 관리자 대상 지정시
}

const ENDPOINTS: Record<UploadChoice, (targetUserId?: string) => string> = {
  avatar: (id?) => id ? `FileManager/Avatar/${id}` : 'FileManager/Avatar',
  image: () => 'FileManager/Image',
  file: () => 'FileManager/File',
  audio: () => 'FileManager/Audio',
  document: () => 'FileManager/Document',
  video: () => 'FileManager/Video',
};

@Service()
export class FileManagerService extends BaseService {

  // ── Signals (Angular 21+ stable) ─────────────────────────────────────
  readonly uploadProgress = signal<IUploadProgress>({
    progress: 0,
    loaded: 0,
    total: 0,
    status: PsStatus.Idle
  });
  readonly isUploading = computed(() => this.uploadProgress().status === PsStatus.Uploading);
  readonly uploadComplete = computed(() => this.uploadProgress().status === PsStatus.Success);

  // ── Subjects → 단순 Subject 로 교체 ──────────────────────────────────
  readonly avatarUpdated$ = new Subject<string>();
  readonly fileUploaded$ = new Subject<string>();
  readonly videoProcessing$ = new Subject<{
    jobId: string;
    status: 'processing' | 'completed' | 'failed';
    hlsPath?: string;
    thumbnailPath?: string;
  }>();

  // ── 핵심: 타입별 탭 처리를 테이블로 선언 ──────────────────────────────
  private readonly TAP_MAP: Partial<Record<UploadChoice, (res: IDataResponse<IFileRequest>) => void>> = {
    avatar: res => {
      const url = res.content?.webpPath;
      if (url) this.avatarUpdated$.next(url);
    },
    video: res => {
      if (res.content) this.videoProcessing$.next({
        jobId: res.content.jobId ?? '',
        status: 'processing',
        hlsPath: res.content.hlsPath,
        thumbnailPath: res.content.thumbnailPath,
      });
    },
  };

  // image, file, audio, document 는 동일 처리 → 기본 처리기
  private readonly defaultTap = (res: IDataResponse<IFileRequest>) => {
    const url = res.content?.webpPath;
    if (url) this.fileUploaded$.next(url);
  };

  // ── Public API: 단일 메서드로 통합 ───────────────────────────────────
  upload$(file: File, choice: UploadChoice, options: UploadOptions = {}): Observable<IDataResponse<IFileRequest> | null> {
    return this.uploadWithProgress(file, choice, options).pipe(
      tap(res => {
        if (!res?.isSuccess) return;
        const handler = this.TAP_MAP[choice] ?? this.defaultTap;
        handler(res);
      }),
    )
  }

  /** fire-and-forget */
  upload(file: File, choice: UploadChoice, options: UploadOptions = {}): void {
    this.upload$(file, choice, options).pipe(catchError(() => of(null))).subscribe();
  }

  /** 멀티 업로드 */
  uploadMultiple$(files: File[], choice: UploadChoice, options: UploadOptions = {})
    : Observable<(IDataResponse<IFileRequest> | null)[]> {

    return forkJoin(
      files.map(f => this.upload$(f, choice, options).pipe(catchError(() => of(null))))
    )
  }

  // ── Core ─────────────────────────────────────────────────────────────
  private uploadWithProgress(
    file: File,
    choice: UploadChoice,
    options: UploadOptions,
  ): Observable<IDataResponse<IFileRequest> | null> {

    const { onProgress, targetUserId } = options;
    const formData = new FormData();
    formData.append('file', file, file.name);
    const endpoint = ENDPOINTS[choice](targetUserId);  // 👈 관리자 분기
    this.uploadProgress.set({ progress: 0, loaded: 0, total: file.size, status: PsStatus.Uploading });

    return this.http.post<IDataResponse<IFileRequest>>(
      `${this.apiUrl}/${endpoint}`, formData, { reportProgress: true, observe: 'events' }
    ).pipe(
      map(event => this.handleEvent(event, onProgress)),
      tap(res => {
        if (res) this.uploadProgress.update(s => ({ ...s, progress: 100, status: PsStatus.Success }));
      }),
      catchError((err: HttpErrorResponse) => {
        this.uploadProgress.update(s => ({ ...s, status: PsStatus.Error }));
        return throwError(() => this.parseError(err));
      }),
      finalize(() => setTimeout(() =>
        this.uploadProgress.set({ progress: 0, loaded: 0, total: 0, status: PsStatus.Idle }), 3_000
      )),
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  validateFile(file: File, maxMb = 50): { valid: boolean; error?: string } {
    const maxSize = maxMb * 1024 * 1024;
    if (file.size > maxSize)
      return { valid: false, error: `파일 크기는 최대 ${maxMb}MB입니다.` };
    return { valid: true };
  }

  private handleEvent(event: HttpEvent<IDataResponse<IFileRequest>>,
    onProgress?: (p: number) => void,
  ): IDataResponse<IFileRequest> | null {
    switch (event.type) {
      case HttpEventType.UploadProgress: {
        const pct = event.total
          ? Math.round(100 * event.loaded / event.total) : 0;
        this.uploadProgress.update(s => ({
          ...s, progress: pct, loaded: event.loaded, total: event.total ?? 0
        }));
        onProgress?.(pct);
        return null;
      }
      case HttpEventType.Response:
        return event.body ?? null;
      default:
        return null;
    }
  }

  private parseError(error: HttpErrorResponse): Error {
    const STATUS_MAP: Record<number, string> = {
      400: error.error?.message ?? '잘못된 요청입니다.',
      401: '로그인 후 다시 시도해 주세요.',
      404: '회원 정보를 찾을 수 없습니다.',
      413: '파일 크기가 허용 한도를 초과했습니다.',
    };
    return new Error(
      STATUS_MAP[error.status]
      ?? error.error?.message
      ?? '업로드 중 오류가 발생했습니다.'
    );
  }
}
