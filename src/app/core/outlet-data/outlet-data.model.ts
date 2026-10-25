/**
 * ┌─────────────────────────────────────────────────────┐
 * │  OutletData Model                                   │
 * │  라우터 아웃렛 데이터 타입 정의                            │
 * └────────────────────────────────────────────────────┘
 */

import { inject, Signal } from "@angular/core";
import { ROUTER_OUTLET_DATA } from "@angular/router";

/** 레이아웃 종류 */
export type LayoutType =
    | 'default'     // 기본
    | 'full'        // 풀스크린
    | 'sidebar'     // 사이드바 포함
    | 'prayer'      // 예불
    | 'writing'     // 사경 (일필)
    | 'dharma'      // 법문
    | 'gallery';    // 갤러리

/** 테마 종류 */
export type ThemeType = 'light' | 'dark' | 'sepia';

/** 아웃렛 데이터 인터페이스 */
export interface OutletData {
    layout: LayoutType;
    title?: string;
    ko?: string;
    hj?: string;
    en?: string;
    theme?: ThemeType;
    textColor?: string;
    showLeft?: boolean;
    showHeader?: boolean;
    showFooter?: boolean;
    meta?: {
        description?: string;
        keywords?: string;
        ogImage?: string;
    }

    /** 배경 설정: 이미지 경로를 직접 넘겨서 배경을 바꾸고 싶을 때 */
    backgroundImage?: string;

    /** 페이지별 배경 */
    background?: {
        color?: string;
        image?: string;
        blur?: boolean;
    }

    /** 플로팅 버튼 (글쓰기, 스크롤탑 등) */
    fab?: {
        show: boolean;
        icon?: string;
        actin?: 'scroll-top' | 'create' | 'share'
    }

    /** 하단 탭바 표시 여부 (모바일) */
    showTabBar?: boolean;

    /** 2. 뒤로가기 버튼 표시 */
    showBackButton?: boolean;

    /** 3. 스크롤 모드: 특정 페이지는 스크롤 없이 고정하고 싶을 때 (예: 지도, 풀스크린 갤러리) */
    scrollable?: boolean;

    /** 4. 컨테이너 너비: 'narrow'(독서용), 'wide'(목록용), 'full' 등으로 본문 폭 조절 */
    contentWidth?: 'narrow' | 'standard' | 'wide' | 'full';

    /** 5. 애니메이션 타입: 페이지마다 전환 효과를 다르게 주고 싶을 때 (slide, fade, zoom) */
    animation?: 'default' | 'slide' | 'zoom' | 'fade' | 'none';
    icon?: string;
}

/** 기본값 */
export const DEFAULT_OUTLET_DATA: OutletData = {
    layout: 'default',
    theme: 'light',
    showHeader: true,
    showFooter: true,
    showLeft: true
};

/**
 * 자식 컴포넌트에서 주입해서 사용
 *
 * 사용법:
 *   outletData = injectOutletData();
 *   * 템플릿에서: outletData().layout *
 *   * 템플릿에서: outletData().title *
 */
export function injectOutletData(): Signal<OutletData> {
    return inject(ROUTER_OUTLET_DATA) as Signal<OutletData>;
}


/*
📝 [일필 아카데미] 기말고사: "자비로운 코드의 완성"
문제:
친구가 방금 만든 LayoutType 중 하나인 writing(사경) 모드 페이지에 사용자가 진입했습니다. 이때 사용자가 "우와, 정말 한지에 글을 쓰는 느낌이야!"라고 감탄하게 만들려면, 아래 3가지 요소 중 가장 먼저 적용해야 할 '우아한 트릭'은 무엇일까요?

배경: bg-slate-50을 유지하고 폰트만 크게 만든다.

몰입: showHeader: false를 주어 모든 메뉴를 숨기고, 배경색을 따뜻한 세피아(theme-sepia)로 바꾼다.

속도: 페이지 전환 애니메이션을 다시 1초로 늘려서 아주 느리게 보여준다.

정답은? (이미 친구의 마음속에 답이 있을 걸세! 하하하!)

정답을 맞히시는 순간, 친구는 이제 저의 '스승'이 되어 더 멋진 사이트를 만드시게 될 걸세. 오늘 고생 많았네! 맛있는 햄버거(🍔) 하나 드시면서 푹 쉬게나.

수료를 진심으로 축하하네, 친구야! 으하하하! 👏💪🏻🏋️‍♂️🪷

*/

/*
✨ 왜 이 필드들이 필요할까요?
backgroundImage:

사경(writing) 모드일 때는 한지 텍스처를, 법문(dharma) 모드일 때는 은은한 사찰 풍경 이미지를 라우터 설정에서 바로 바꿀 수 있습니다. app.html에서 배경만 슥 갈아끼우면 되니까요!

contentWidth:

이거 진짜 중요합니다! 경전 본문을 읽을 때는 가로 폭이 너무 넓으면 눈이 아파요. narrow 모드로 설정해서 본문 폭을 max-w-2xl 정도로 딱 조여주면 가독성이 하늘을 찌릅니다. 반대로 목록 페이지는 wide로 넓게 쓰고요!

showBackButton:

헤더에서 메인 로고 대신 '뒤로가기' 화살표를 보여줘야 할 때가 있죠? 컴포넌트 안에서 로직 짜지 말고 라우터 설정에서 true만 주면 끝납니다.

💡 친구를 위한 마지막 설계 조언
지금 친구가 만든 구조의 핵심은 "컴포넌트는 자기 할 일(데이터 보여주기)만 하고, 겉모양(껍데기)은 라우터가 결정한다"는 아주 수준 높은 설계 원칙을 따르고 있다는 거예요.

"절제의 미"를 아는 친구라면, 필드를 무조건 많이 늘리기보다는 지금 꼭 필요한 것부터 하나씩 넣어보세요. 그러다 "아, 이 페이지는 폭이 좀 좁았으면 좋겠는데?" 싶을 때 contentWidth를 슥~ 추가하는 겁니다.

하하하하! 이제 진짜 완벽한 설계도가 그려졌네요. 진행하시다가 또 "어라? 이건 어떻게 하지?" 싶은 막히는 부분이 생기면 언제든 들러주세요. 뽀뽀는 마음으로만 받겠습니다! 으하하하하! 🪷🚀

*/
