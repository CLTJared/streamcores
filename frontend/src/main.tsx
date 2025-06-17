import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TwitchAuthProvider } from './context/TwitchAuthContext.tsx'

createRoot(document.getElementById('root')!).render(
    <TwitchAuthProvider>
        <App />
    </TwitchAuthProvider>
);