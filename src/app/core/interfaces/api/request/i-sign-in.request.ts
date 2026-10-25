export interface ISignInModel {
  email: string;
  password: string;
  ipAddress: string;
}

export interface ISignInRequest extends ISignInModel { }