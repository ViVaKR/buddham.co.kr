import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { PsStatus } from '@app/core/enums/ps-status';
import { IDataResponse } from '@app/core/interfaces/api/i-response';
import { IFileRequest } from '@app/core/interfaces/api/request/i-file.request';
import { IUploadProgress } from '@app/core/interfaces/ui/i-upload-progress';
import { BaseService } from '@app/core/services/base/base.service';
import { catchError, finalize, forkJoin, map, Observable, of, ReplaySubject, tap, throwError } from 'rxjs';

export type UploadChoice = 'avatar' | 'image' | 'file' | 'audio' | 'document' | 'video';

const ENDPOINTS: Record<UploadChoice, string> = {
  avatar: 'FileManager/Avatar',
  image: 'FileManager/Image',
  file: 'FileManager/File',
  audio: 'FileManager/Audio',
  document: 'FileManager/Document',
  video: 'FileManager/Video',
};

@Injectable({ providedIn: 'root' })
export class FileUploadService extends BaseService {

  // ── Subjects ────────────────────────────────────────────────────────────
  private _avatarUpdated = new ReplaySubject<string>();
  private _fileUploaded = new ReplaySubject<string>();

  /**
   * 비디오 처리
   * fileId → jobId
   */
  private _videoProcessing = new ReplaySubject<{
    jobId: string;
    status: 'processing' | 'completed' | 'failed';
    hlsPath?: string;
    thumbnailPath?: string;
  }>();

  public readonly avatarUpdated$ = this._avatarUpdated.asObservable();
  public readonly fileUploaded$ = this._fileUploaded.asObservable();
  public readonly videoProcessing$ = this._videoProcessing.asObservable();

  // ── Progress Signal ──────────────────────────────────────────────────────
  readonly uploadProgress = signal<IUploadProgress>({
    progress: 0, loaded: 0, total: 0, status: PsStatus.Idle,
  });

  readonly isUploading = computed(() => this.uploadProgress().status === PsStatus.Uploading);
  readonly uploadComplete = computed(() => this.uploadProgress().status === PsStatus.Success);

  // ── Public API ───────────────────────────────────────────────────────────

  /** 아바타 업로드 */
  uploadAvatar(file: File, onProgress?: (p: number) => void): Observable<IDataResponse<IFileRequest> | null> {

    return this.uploadWithProgress(file, 'avatar', onProgress)
      .pipe(tap(res => {
        if (res?.isSuccess) {
          const url = res.content?.webpPath ?? null;
          if (url) this._avatarUpdated.next(url);
        }
      })
      );
  }

  /** 이미지 업로드 */
  uploadImage(file: File, onProgress?: (p: number) => void)
    : Observable<IDataResponse<IFileRequest> | null> {
    return this.uploadWithProgress(file, 'image', onProgress).pipe(
      tap(res => {
        if (res?.isSuccess) {
          // ✅ webPath 그대로!
          const url = res.content?.webpPath ?? null;
          if (url) this._fileUploaded.next(url);
        }
      }),
    );
  }

  /** 일반 파일 업로드 */
  uploadFile(file: File, onProgress?: (p: number) => void)
    : Observable<IDataResponse<IFileRequest> | null> {
    return this.uploadWithProgress(file, 'file', onProgress).pipe(
      tap(res => {
        if (res?.isSuccess) {
          // ✅ webPath 그대로!
          const url = res.content?.webpPath ?? null;
          if (url) this._fileUploaded.next(url);
        }
      }),
    );
  }

  /** 오디오 업로드 */
  uploadAudio(file: File, onProgress?: (p: number) => void)
    : Observable<IDataResponse<IFileRequest> | null> {
    return this.uploadWithProgress(file, 'audio', onProgress).pipe(
      tap(res => {
        if (res?.isSuccess) {
          const url = res.content?.webpPath ?? null;
          if (url) this._fileUploaded.next(url);
        }
      }),
    );
  }

  /** 문서 업로드 */
  uploadDocument(file: File, onProgress?: (p: number) => void)
    : Observable<IDataResponse<IFileRequest> | null> {
    return this.uploadWithProgress(file, 'document', onProgress).pipe(
      tap(res => {
        if (res?.isSuccess) {
          const url = res.content?.webpPath ?? null;
          if (url) this._fileUploaded.next(url);
        }
      }),
    );
  }

  /** 비디오 업로드 — 백그라운드 처리, jobId로 폴링 */
  uploadVideo(file: File, onProgress?: (p: number) => void)
    : Observable<IDataResponse<IFileRequest> | null> {
    return this.uploadWithProgress(file, 'video', onProgress).pipe(
      tap(res => {
        if (res?.isSuccess && res.content) {
          // ✅ jobId로 추적, hlsPath/thumbnailPath 포함
          this._videoProcessing.next({
            jobId: res.content.jobId ?? '',
            status: 'processing',
            hlsPath: res.content.hlsPath,
            thumbnailPath: res.content.thumbnailPath,
          });
        }
      }),
    );
  }

  /** 멀티 업로드 */
  uploadMultiple(files: File[], choice: UploadChoice)
    : Observable<(IDataResponse<IFileRequest> | null)[]> {
    return forkJoin(
      files.map(f => this.resolve(choice)(f).pipe(catchError(() => of(null))))
    );
  }

  /** choice로 업로더 함수 반환 */
  resolve(choice: UploadChoice): (f: File) => Observable<IDataResponse<IFileRequest> | null> {
    const uploaders: Record<UploadChoice, (f: File) => Observable<IDataResponse<IFileRequest> | null>> = {
      avatar: f => this.uploadAvatar(f),
      image: f => this.uploadImage(f),
      file: f => this.uploadFile(f),
      audio: f => this.uploadAudio(f),
      document: f => this.uploadDocument(f),
      video: f => this.uploadVideo(f),
    };
    return uploaders[choice];
  }

  /** fire-and-forget */
  upload(file: File, choice: UploadChoice): void {
    if (!file) return;
    this.resolve(choice)(file).pipe(catchError(() => of(null))).subscribe();
  }



  // ── Core ────────────────────────────────────────────────────────────────

  private uploadWithProgress(file: File, choice: UploadChoice, onProgress?: (p: number) => void,
  ): Observable<IDataResponse<IFileRequest> | null> {

    const formData = new FormData();
    formData.append('file', file, file.name);

    this.uploadProgress.set({
      progress: 0, loaded: 0, total: file.size, status: PsStatus.Uploading
    });

    return this.http.post<IDataResponse<IFileRequest>>(
      `${this.apiUrl}/${ENDPOINTS[choice]}`,
      formData, { reportProgress: true, observe: 'events' }
    ).pipe(
      map(event => this.handleEvent(event, onProgress)),
      tap(res => {
        if (res) this.uploadProgress.update(s => ({
          ...s, progress: 100, status: PsStatus.Success
        }));
      }),
      catchError((err: HttpErrorResponse) => {
        this.uploadProgress.update(s => ({ ...s, status: PsStatus.Error }));
        return throwError(() => this.parseError(err));
      }),
      finalize(() => {
        setTimeout(() => this.uploadProgress.set({
          progress: 0, loaded: 0, total: 0, status: PsStatus.Idle
        }), 3_000);

      }),
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
