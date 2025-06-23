import type { Toast } from "@/models/Toast";
import React, { useState, useCallback } from 'react';
import { ToastContext } from "../context/ToastContext";

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [toast, setToast] = useState<Toast[]>([]);
 
 const removeToast = useCallback((id: string) => {
    setToast((prev) => prev.filter((toast) => toast.id !== id));
 }, []);

 const addToast = useCallback((message: string, title: string = '', type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2,9);
    const newToast = { id, title, message, type };

    setToast((prev) => {
      const updated = [...prev, newToast];
      // Log to verify toast state is updated
      // console.log("✅ New toast state:", updated);
      return updated;
    });

    setTimeout(() => removeToast(id), 8_000)
 }, [removeToast]);

 return <ToastContext.Provider value={{ toast, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
}