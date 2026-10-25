import { POSTTYPE_OPTIONS } from "./post-typs";

export type EnumOption = {
    value?: any;
    label: string;
    [key: string]: any; // 나머지 프로퍼티 허용
};

export const ENUM_REGISTRY: Record<string, EnumOption[]> = {
    'PostType': POSTTYPE_OPTIONS,
};
