// * 순수 알맹이로 구성
export interface IUserRoleBase {
  name: string;
  koName: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  isSystem: boolean;
}

// 최종 완제품
export interface IUserRoleView extends IUserRoleBase {
  id: string,
  normalizedName: string;
  createdAt: string;
  updatedAt: string;
  rowVersion: number;
}

// Create / Update
export interface IUserRolePayload extends IUserRoleBase {
  id?: string,
  rowVersion?: string
};
