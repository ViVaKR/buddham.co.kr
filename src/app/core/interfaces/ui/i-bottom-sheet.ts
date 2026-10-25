export interface IBottomSheet {
    title?: string;
    content?: string;
    success?: boolean;

    type?: 'alert' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;

}
