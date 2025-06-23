import { useContext } from 'react';
import { ToastContext } from '@/context/ToastContext'; // or wherever it's defined
import { type ToastContextType } from '@/models/Toast';

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};