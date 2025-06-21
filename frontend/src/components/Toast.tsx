import React from 'react';
import { useToast } from '@/context/ToastContext';

const toastStyles = { 
    success: 'bg-slate-700',
    error: 'bg-red-300',
    info: 'bg-purple-600',
}

export const ToastContainer = () => {
    const { toast } = useToast();

    return ( 
    <div className="">
        {toast.map((toast) => (
            <div key={toast.id} className={`${toastStyles[toast.type || 'info']} px-4 py-2 rounded shadow-lg animate-slide-in`}> 
                {toast.message}
            </div>
        ))};
    </div>
    ); 
};