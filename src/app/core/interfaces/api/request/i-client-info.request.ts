export interface IClientInfoModel {

  ip: string;
  city: string;
  region: string;
  country: string;
  location: string;
  isp: string;
  timezone: string;
}

export interface IClientInfoRequest extends IClientInfoModel { }