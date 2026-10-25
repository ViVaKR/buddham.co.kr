import { getTitle, Paths } from '@app/data/menu-data';
import { buildStandardRoutes } from '@app/pages/route.factor';
import { Roles } from '@shared/constants/roles.contants';
export default buildStandardRoutes(
  [Paths.SecuritySettings.url], // 1
  getTitle, // 2
  undefined, // 3
  undefined, // 4
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
      mandala: Roles.Public,
      samsara: Roles.Public,
      karma: Roles.Public,
      vipassana: Roles.Public,
    },
  },
);
