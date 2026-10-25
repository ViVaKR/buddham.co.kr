import { getTitle, Paths } from "@app/data/menu-data";
import { buildStandardRoutes } from "@app/pages/route.factor";
import { Roles } from "@app/shared/constants/roles.contants";
export default buildStandardRoutes(
  [Paths.AccountRole.url],
  getTitle,
  undefined,
  undefined,
  {
    layout: 'default',
    defaultPath: 'mandala',
    showHeader: true,
    showLeft: true,
    showFooter: false,
    showBar: true,
    showBarOverrides: {
      karma: false,
    },
    roleOverrides: {
      mandala: Roles.Admin,
      samsara: Roles.Admin,
      karma: Roles.Admin,
      vipassana: Roles.Admin,
    },
  }
);
