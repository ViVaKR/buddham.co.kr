import { getTitle, Paths } from '@app/data/menu-data';
import { buildStandardRoutes } from '@app/pages/route.factor';
export default buildStandardRoutes(
  [Paths.Guide.url], // 1
  getTitle, // 2
  undefined, // 3
  undefined, // 4
  {
    defaultPath: 'mandala',
    showHeader: true,
    showLeft: true,
    showFooter: false,
  },
);
