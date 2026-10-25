export interface ISignUpModel {
    email: string;
    fullName: string;
    pseudonym: string;
    password: string;
    confirmPassword: string;
}

export interface ISignUpRequest extends Omit<ISignUpModel, 'confirmPassword'> { }
