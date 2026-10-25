export interface IForgotPasswordBase {
  email: string;
}

export interface IForgotPasswordView extends IForgotPasswordBase {
  replyUrl: string;
}
export interface IForgotPasswordPayload extends IForgotPasswordBase {
  replyUrl: string;
}

export interface IForgotPasswordMessage {
  message: string;
  pseudonym?: string;
}
