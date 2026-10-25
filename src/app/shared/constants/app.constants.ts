// breakpoints.constants.t
export const AppBreakpoints = {
    Mobile: '(max-width: 767px)',
    Tablet: '(min-width: 768px) and (max-width: 1279px)',
    Desktop: '(min-width: 1280px)',

    // 조합형
    MobileAndTablet: '(max-width: 1279px)',
    TabletAndDesktop: '(min-width: 768px)',

    // 기준값 (숫자가 필요할 때)
    MobileMax: 767,
    TabletMin: 768,
    TabletMax: 1279,
    DesktopMin: 1280,
} as const;