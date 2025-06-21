export type Toast = {
    id: string;
    title?: string;
    message: string;
    type?: 'success' | 'info' | 'error';
}

export type ToastContextType = {
    toast: Toast[];
    addToast: (message: string, title?: string, type?: Toast['type']) => void;
    removeToast: (id: string) => void;
}