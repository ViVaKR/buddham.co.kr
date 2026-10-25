import { Pipe, PipeTransform } from '@angular/core';
import { ENUM_REGISTRY } from '../enums/enum-registry';
import { resolveEnumLabel } from '../enums/enum-utils';

@Pipe({ name: 'enumToKey', standalone: true, pure: true })
export class EnumToKeyPipe implements PipeTransform {

  transform(
    value: number,
    type: 'label' | 'displayText' = 'label',
    enumType?: string
  ): string {
    if (!enumType) {
      for (const options of Object.values(ENUM_REGISTRY)) {
        const option = options.find(opt => opt.value === value);
        if (option) return String(option[type] ?? value);
      }
      return String(value ?? '');
    }
    return resolveEnumLabel(value, enumType, type);
  }
}
