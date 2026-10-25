export interface IConfirmEmailBase {
  email: string;
  token: string;
}

export interface IConfirmEmailView extends IConfirmEmailBase {}

export interface IConfirmEmailPayload extends IConfirmEmailBase {}
