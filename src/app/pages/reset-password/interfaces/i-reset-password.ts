export interface IResetPasswordBase {
  email: string;
}

export interface IResetPasswordView extends IResetPasswordBase {
  token: string;
}

export interface IResetPasswordPayload extends IResetPasswordBase {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IResetPasswordMessage {
  message: string;
}
