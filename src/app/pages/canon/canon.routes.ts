import { getTitle, Paths } from "@app/data/menu-data";
import { buildStandardRoutes } from "@app/pages/route.factor";
import { Roles } from "@app/shared/constants/roles.contants";
export default buildStandardRoutes(
  [Paths.Canon.url],
  getTitle,
  undefined,
  undefined,
  {
    defaultPath: 'mandala',
    showHeader: true,
    showLeft: true,
    showBar: true,
    showFooter: true,
    roleOverrides: {
      mandala: Roles.Public,
      samsara: Roles.Public,
      karma: Roles.Public,
      vipassana: Roles.Admin,
    }
  }
);
