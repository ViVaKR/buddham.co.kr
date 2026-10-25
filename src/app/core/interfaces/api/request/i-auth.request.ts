export interface ISignInRequest {
    email: string;
    password: string;
    deviceFingerprint?: string;
}

export interface ISignUpRequest {
    fullName: string;
    pseudonym: string;
    email: string;
    password: string;
}

export interface ICheckPasswordRequest {
    password: string;
}

export interface IChangePasswordRequest {
    email: string;
    oldPassword: string;
    newPassword: string;
    newPasswordConfirm: string;
}

export interface IUpdateUserRequest {
    id: string;
    fullName: string;
    avatar: string;
    pseudonym: string;
    introduction: string;
    provider: string;
    timeZone: string;
    locale: string;
}

export interface IUpdatePsedonymRequest {
    id?: string | null;
    pseudonym?: string | null;
}

export interface IUpdateFullNameRequest {
    id?: string | null;
    fullName: string | null;
}

export interface IResetPasswordRequest {
    email: string;
    token: string;
    newPassword: string;
}

export interface IForgotPasswordRequest {
    email: string;
    clientUri: string;
}

export interface IEmailSignUpRequest extends ISignUpRequest {
    fullName: string;
    email: string;
    password: string;
}

export interface ICheckDuplicatePseudonymRequest {
    pseudonym: string;
}

export interface ICheckDuplicationEmailRequest {
    email: string;
}

export interface ITokenRefreshRequest {
    accessToken: string;
    refreshToken: string;
}

export interface INirvanaByAdminRequest {
    userId: string;
}

export interface INirvanaByUserRequest {
    email: string;
    password: string;
}

export interface IWidrawRequest {
    password: string;
}