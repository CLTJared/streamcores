import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TwitchAuthProvider } from './context/TwitchAuthContext.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <TwitchAuthProvider>
            <App />
        </TwitchAuthProvider>
    </BrowserRouter>
);