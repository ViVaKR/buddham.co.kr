import { getTitle, Paths } from '@app/data/menu-data';
import { buildStandardRoutes } from '@app/pages/route.factor';
import { Roles } from '@shared/constants/roles.contants';
export default buildStandardRoutes([Paths.ConfirmEmail.url], getTitle, undefined, undefined, {
  defaultPath: 'karma',
  roleOverrides: {
    mandala: Roles.User,
    samsara: Roles.User,
    karma: Roles.User,
    vipassana: Roles.User,
  },
});
