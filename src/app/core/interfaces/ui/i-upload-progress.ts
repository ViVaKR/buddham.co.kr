import { PsStatus } from "@app/core/enums/ps-status";

export interface IUploadProgress {
    progress: number;
    loaded: number;
    total: number;
    status: PsStatus
}
