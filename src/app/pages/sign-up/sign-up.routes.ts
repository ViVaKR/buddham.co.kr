import { getTitle, Paths } from "@app/data/menu-data";
import { buildStandardRoutes } from "@app/pages/route.factor";
import { Roles } from "@app/shared/constants/roles.contants";
export default buildStandardRoutes(
    [Paths.SignUp.url],
    getTitle,
    undefined,
    undefined,
    {
        defaultPath: 'karma',
        showHeader: true,
        showLeft: false,
        showFooter: false,
        showBar: true,
        showBarOverrides: { karma: false },
        roleOverrides: {
            mandala: Roles.Admin, // Home, 만다라 - 깨달음의 장소
            samsara: Roles.Admin, // List, 삼사라 - 만상의 나열, 윤회 포함
            karma: Roles.Public, // Form, 카르마 - 업을 짓는 행위
            vipassana: Roles.Admin // Detail, 위빠사나 - 관조, 사물 그대로의 모습을 꿰뚫어 보는 통찰
        }
    }
);
