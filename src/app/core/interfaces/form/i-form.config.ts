import { AbstractControlOptions } from "@angular/forms";
import { IFieldConfig } from "@app/core/interfaces/form/i-field.config";

export interface IFormConfig<T> {
    fields: { [K in keyof T]: IFieldConfig };
    groupOptions?: AbstractControlOptions;
}
