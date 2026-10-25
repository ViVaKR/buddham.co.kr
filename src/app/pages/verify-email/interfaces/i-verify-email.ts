export interface IVerifyEmailBase {
  email: string;
}

export interface IVerifyEmailView extends IVerifyEmailBase {}

export interface IVerifyEmailPayload extends IVerifyEmailBase {
  replyUrl: string;
}

export interface IVerifyEmailMessage {
  message: string;
}
