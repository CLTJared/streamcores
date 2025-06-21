import type { Toast, ToastContextType } from "@/models/Toast";
import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [toast, setToast] = useState<Toast[]>([]);
 
 const removeToast = useCallback((id: string) => {
    setToast((prev) => prev.filter((toast) => toast.id !== id));
 }, []);

 const addToast = useCallback((message: string, title: string = '', type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2,9);
    setToast((prev) => [...prev, { id, title, message, type }])
    setTimeout(() => removeToast(id), 3000)
 }, [removeToast]);



 return <ToastContext.Provider value={{ toast, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};