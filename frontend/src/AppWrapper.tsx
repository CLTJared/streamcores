import { useState, useCallback } from 'react';
import App from './App';
import TwitchEventListener from '@/components/TwitchEventListener';
import { type FrontendMessage } from '@/models/Chat';
import { useTwitchAuth } from '@/context/TwitchAuthContext';

export default function AppWrapper() {
  const [messages, setMessages] = useState<FrontendMessage[]>([]);
  const [channel, setChannel] = useState<string>('');
  const { accessToken, isAuthenticated, logout } = useTwitchAuth();

  const handleMessage = useCallback((msg: FrontendMessage) => {
    setMessages((prev) => [...prev, msg].slice(-100));
  }, []);

  return (
    <>
      <TwitchEventListener
        accessToken={accessToken}
        channel={channel}
        onMessage={handleMessage}
      />
      <App
        accessToken={accessToken}
        isAuthenticated={isAuthenticated}
        logout={logout}
        channel={channel}
        setChannel={setChannel}
        messages={messages}
        setMessages={setMessages}
      />
    </>
  );
}