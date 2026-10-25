// form-builder.types.ts

// 폼에서 허용할 값 타입 명시
export type FormFieldValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | File
    | Date
    | {}
    | [];
