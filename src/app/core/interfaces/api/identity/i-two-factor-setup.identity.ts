export interface ITwoFactorSetupIdentity {
    sharedKey: string;
    qrCodeImageUrl: string;
    authenticatorUri: string;
    recoveryCodes: string[];
}
