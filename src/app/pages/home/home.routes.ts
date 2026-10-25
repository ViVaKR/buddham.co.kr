import { getTitle, Paths } from "@app/data/menu-data";
import { buildStandardRoutes } from "@app/pages/route.factor";
export default buildStandardRoutes([Paths.Home.url],
    getTitle,
    undefined,
    undefined, {
    showBar: true,
    showBarOverrides: {
        mandala: false // showBar 처리
    }
});
