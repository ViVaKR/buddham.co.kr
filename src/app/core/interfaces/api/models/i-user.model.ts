import { IUserRoleRequest } from '@app/core/interfaces/api/request/i-user-role.request';

export interface IUserBase {
  fullName: string;
  pseudonym: string;
  email: string;
  avatar?: string;
  introduction?: string;
  provider: string;
  timeZone?: string;
  locale?: string;
}

export interface IUserView extends IUserBase {
  id: string;
  isActive: boolean;
  emailConfirmed: boolean;
  accessFailedCount: number;
  twoFactorEnabled?: boolean;
  trustedDeviceKey?: string;
  lastLoginAt?: string;
  lastLoginIP?: string;
  createdAt: string;
  updatedAt?: Date | string;
  roles: IUserRoleRequest[];
}

export interface IUserPayload extends IUserBase {
  id?: string;
  rowVersion?: string;
}

// export interface IUserDetailModel {
//   id: string;
//   fullName: string;
//   pseudonym: string;
//   email: string;
//   emailConfirmed?: boolean;
//   accessFailedCount: number;
//   twoFactorEnabled?: boolean;
//   avatar?: string;
//   trustedDeviceKey?: string;
//   provider: string;
//   createdAt: string;
//   updatedAt?: string;
//   timeZone?: string;
//   locale?: string;
//   isActive: boolean;
//   lastLoginAt?: string;
//   lastLoginIP?: string;
//   introduction?: string
//   roles?: IUserRoleRequest[];
// }
