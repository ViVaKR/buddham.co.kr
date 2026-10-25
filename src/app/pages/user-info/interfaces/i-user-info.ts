import { IUserRoleRequest } from "@app/core/interfaces/api/request/i-user-role.request";
import { IReply } from "@app/core/interfaces/ui/i-reply";

export interface IUserInfoBase {
  userName?: string;
  email: string;
  fullName: string;
  pseudonym: string;
  avatar?: string;
  provider: string;
  introduction?: string;
  rowVersion?: string;
  roles?: IUserRoleRequest[];
}

export interface IUserInfoView extends IUserInfoBase {
  id: string;
  normalizedUserName?: string;
  normalizedEmail?: string;
  emailConfirmed?: boolean;
  accessFailedCount: number;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
  lockoutEnabled: boolean;
  lockoutEnd?: string;
  lastLoginAt?: string;
  lastLoginIP?: string;
  timeZone?: string;
  locale?: string;
  isActive: boolean;
}

export interface IUserInfoPayload extends IUserInfoBase {
  id?: string;
  timeZone?: string;
  locale?: string;
}

export interface IUserInfoUpdateRole {
  id: string;
  roles: string[];
}

export interface IUserInfoComment extends IReply {
  targetId?: number;
}