import { getTitle, Paths } from "@app/data/menu-data";
import { buildStandardRoutes } from "@app/pages/route.factor";
import { Icons } from "@app/shared/constants/icon.constants";
import { Roles } from "@app/shared/constants/roles.contants";

export default buildStandardRoutes(
    [Paths.SignIn.url], // 1.
    getTitle, // 2. 
    undefined, // 3. 
    undefined, // 4. 
    { // 5. 
        layout: 'default',
        theme: 'light',
        animation: 'fade',
        icon: Icons.EditNote,
        showBar: true,     // ✅ 상단 showBar 기본적으로 보기
        showBarOverrides: {
            karma: false // showBar 숨김
        },
        showLeft: false,    // ✅ 왼쪽 메뉴 (split) 숨김
        showHeader: true,  // ✅ 헤더 메뉴바 (menu-bar)
        showFooter: false,
        roleOverrides: {
            mandala: Roles.Admin,    // 누구나
            samsara: Roles.Admin,      // 로그인 회원 이상
            karma: Roles.Public,    // 편집자 이상
            vipassana: Roles.Verified, // 인증 회원 이상
        },
        defaultPath: 'karma',
    },
);
