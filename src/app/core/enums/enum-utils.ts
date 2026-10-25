import { ENUM_REGISTRY, EnumOption } from "./enum-registry";

export function resolveEnumLabel(
    value: unknown,
    enumType: string,
    property: string = 'label'
): string {
    if (value === null || value === undefined) return '';
    const options = ENUM_REGISTRY[enumType]; // Map.get() → 그냥 []
    if (!options) {
        console.warn(`⚠️ ENUM_REGISTRY에 '${enumType}' 없음`);
        return String(value);
    }
    const option = options.find((opt: EnumOption) => opt.value === value);
    return option ? String(option[property] ?? value) : String(value);
}

export function getEnumOptions<T>(enumObj: T): { label: string, value: any }[] {

    return Object.keys(enumObj as any)
        .filter(key => isNaN(Number(key)))
        .map(key => ({
            label: key,
            value: (enumObj as any)[key]
        }));
}
