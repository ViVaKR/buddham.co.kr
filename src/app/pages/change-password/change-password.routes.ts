import { getTitle, Paths } from "@app/data/menu-data";
import { buildStandardRoutes } from "@app/pages/route.factor";
export default buildStandardRoutes([Paths.ChangePassword.url], getTitle);
