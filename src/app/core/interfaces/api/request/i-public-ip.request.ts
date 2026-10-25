export interface IPublicIpModel {
  ip: string;
  type: string;
  timestamp: Date;
  headers: IPublicIpHeaders;
}

export interface IPublicIpHeaders {
  "x-forwarded-for": string;
  "x-real-ip": string;
}

export interface IPublicIpRequest extends IPublicIpModel { }

export interface IPublicIpText {
  ip: string;
}
