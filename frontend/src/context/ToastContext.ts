import { createContext } from 'react';
import type { ToastContextType } from '@/models/Toast';

export const ToastContext = createContext<ToastContextType | undefined>(undefined);