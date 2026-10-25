import { RsCode } from "@app/core/enums/rs-code";

export interface IResponseBase {
    isSuccess: boolean;
    message: string;
    code: RsCode;
    processedAt: string; // HTTP JSON 응답에서는 기본적으로 ISO 문자열로 넘어옵니다.
    meta?: any;
    validationErrors?: Record<string, string[]>;
    traceId?: string;
}
