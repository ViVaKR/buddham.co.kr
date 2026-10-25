export interface IAuthIdentity {
    isSuccess: boolean;
    userId?: string;
    email?: string;
    token?: string;
    message: string;
    refreshToken?: string;
    refreshTokenExpiry?: string;
    emailConfirmed?: boolean;
    showEmailWarning?: boolean;
    requiresTwoFactor?: boolean;
    hasTwoFactorEnabled?: boolean;
}
