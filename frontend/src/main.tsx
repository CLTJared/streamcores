import '@/index.css'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TwitchAuthProvider } from '@/providers/TwitchAuthProvider'
import { ToastProvider } from '@/providers/ToastProvider'
import AppWrapper from '@/AppWrapper.tsx';

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <TwitchAuthProvider>
            <ToastProvider>
                <AppWrapper />
            </ToastProvider>
        </TwitchAuthProvider>
    </BrowserRouter>
);