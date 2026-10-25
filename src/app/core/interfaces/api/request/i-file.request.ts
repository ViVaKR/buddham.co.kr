import { FileStatus } from "@app/core/enums/file-status";
import { FileType } from "@app/core/enums/file-type";

export interface IFileRequest {
    // ── 기본 정보 ──────────────────────────────
    id?: number;
    userId?: string;
    storedFileName?: string;
    originalFilename?: string;
    contentType?: string;
    size?: number;
    fileType?: FileType;
    status?: FileStatus;

    // ── 경로 ───────────────────────────────────
    path?: string;
    webpPath?: string;
    thumbnailPath?: string;

    // ── 비디오 전용 ────────────────────────────
    hlsPath?: string;        // 스트리밍 (.m3u8)
    mp4Path?: string;        // 다운로드용
    duration?: number;       // 재생 시간 (초)
    resolution?: string;     // "1920x1080"
    jobId?: string;          // ✅ 백그라운드 처리 추적용!

    // ── 메타 ───────────────────────────────────
    createdAt?: string;
    updatedAt?: string;
}
