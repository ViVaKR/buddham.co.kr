import { getTitle, Paths } from "@app/data/menu-data";
import { buildStandardRoutes } from "@app/pages/route.factor";
import { Roles } from "@app/shared/constants/roles.contants";
export default buildStandardRoutes(
  [Paths.UserInfo.url],
  getTitle,
  undefined,
  undefined,
  {
    defaultPath: 'samsara',
    showFooter: false,
    roleOverrides: {
      mandala: Roles.Admin,
      samsara: Roles.Admin,
      karma: Roles.User,
      vipassana: Roles.Admin
    }
  });
