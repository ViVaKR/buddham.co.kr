export interface ITwoFactorLoginRequest {
    email: string;
    code: string;
    rememberDevice: boolean;
    deviceFingerprint?: string;
}
