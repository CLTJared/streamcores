// App.tsx
import { useEffect, useRef, useState } from "react";
import { type Follower, type FrontendMessage, type MediaItem } from "@/models/Message";
import Header from "@/components/Header";
import Button from "@/components/Button";
import { useTwitchAuth } from "@/hooks/useTwitchAuth";
import { Route, Routes } from "react-router-dom";
import Auth from "@/callback/Auth";
import LinkPreview from "@/components/LinkPreview";
import TwitchChat from "@/components/TwitchChat";

interface Props {
  channel: string;
  setChannel: (channel: string) => void;
  messages: FrontendMessage[];
  setMessages: React.Dispatch<React.SetStateAction<FrontendMessage[]>>;  // Add this
  onConnect: (channel: string) => void;
  status: string;
  media: MediaItem[];
  setMedia: React.Dispatch<React.SetStateAction<MediaItem[]>>;
  userId: string | null;
}

type TwitchFollowedStream = {
  user_id: string;
  user_name: string;
  // other fields like title, game_id, etc. can be added if needed
};

export default function App({
  channel,
  setChannel,
  messages,
  onConnect,
  status,
  media,
  setMedia,
  userId,
}: Props) {
  const [follows, setFollows] = useState<Follower[]>([]);
  const prevFollowsRef = useRef<Record<string, Follower>>({});
  const { isAuthenticated, logout, accessToken } = useTwitchAuth();

  useEffect(() => {
    console.log('loadFollows', accessToken, userId)
    if (!accessToken || !userId) return;
    const loadFollows = async () => {
      try {
        const followRes = await fetch(
          `https://api.twitch.tv/helix/streams/followed?user_id=${userId}&first=100`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Client-ID": import.meta.env.VITE_TWITCH_CLIENT_ID,
            },
          }
        );

        const followData = await followRes.json();
        const currData: Follower[] = followData.data.map((f: TwitchFollowedStream ) => ({
          userId: f.user_id,
          username: f.user_name,
        }));

        // Lookup previous followed channels
        const prevData = prevFollowsRef.current;
        const nextData: Follower[] = currData.map((f) => ({
          ...f,
          isNew: !prevData[f.userId]
        }))

        setFollows((nextData || []).map((f) => ({
          ...f,
          isNew: !prevData[f.userId],
        })));

        // Update ref for next comparison
        prevFollowsRef.current = currData.reduce<Record<string, Follower>>((acc, f) => {
          acc[f.userId] = f;
          return acc;
        }, {});

      } catch (e) {
        console.error("Failed to fetch follows:", e);
      }
    };
    loadFollows();
    const iv = setInterval(loadFollows, 60_000);
    return () => clearInterval(iv);
  }, [accessToken, userId]);

  return (
    <main className="min-w-10 mx-2 py-2">
      <Header channel={channel} setChannel={setChannel} onConnect={() => onConnect(channel)} />
      <div className="my-2 ms-2">
        <Routes>
          <Route path="/callback/auth" element={<Auth />} />
          <Route
            path="/"
            element={
              <Button
                className="bg-purple-500 hover:bg-purple-600 text-neutral-50"
                onClick={() => {
                  if (isAuthenticated) logout();
                  else {
                    const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
                    const redirectUri = encodeURIComponent("http://localhost:5173/callback/auth");
                    const scopes = encodeURIComponent("chat:read user:read:follows");
                    window.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}`;
                  }
                }}
              >
                {isAuthenticated ? "Logout" : "Login with Twitch"}
              </Button>
            }
          />
        </Routes>
      </div>
      <span className="inline-block min-w-full px-4 font-semibold">{status}</span>
      <div className="flex">
        <aside className="p-4">
          <h3>Online: {follows.length}</h3>
          <div className={`bg-slate-950 text-neutral-50 max-h-[600px] overflow-y-auto rounded`}>
            {follows.map((f) => {
              const isActive = f.username.toLowerCase() === channel.toLowerCase(); // normalize case
              
              return (
                <div key={f.userId} 
                    className={`${isActive ? 'bg-purple-600 font-semibold' : 'hover:bg-purple-950'}
                    flex ps-2 py-1 gap-2 cursor-pointer`}>
                <p
                  className="grow"
                  onClick={() => onConnect(f.username)}
                >
                  {f.username}
                </p>
                <span className="select-none animate-pulse text-right text-purple-400 pe-2">
                  { f.isNew ? '•' : '\u00A0' }
                </span> 
                </div>
              );
            })}
          </div>
        </aside>
        <section className="p-4 grow">
          <span>Stream Chat</span>
          <div className="bg-slate-950 rounded pt-2 mb-2 h-[600px] overflow-y-auto flex flex-col-reverse leading-7">
            <div id="chat-wrapper">
            {messages
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((msg, idx) => (
                <TwitchChat
                  key={msg.id}
                  msg={msg}
                  channel={channel}
                  index={idx} // stable relative index after sorting
                />
              ))
            }
            <div id="chat-direction"></div>
            </div>
          </div>
        </section>
        <section className="py-4 min-w-50 w-50">
          <h3>Stream Media (URLs)</h3>
          <article className="h-[600px] overflow-y-auto overflow-x-hidden flex flex-col">
              {media.length === 0 ? (
                <p>No media URLs found yet.</p>
              ) : (
                media.map((item, i) => (
                  <LinkPreview 
                    key={i} 
                    url={item.url} 
                    submitter={item.displayName} 
                    onRemove={(urlToRemove) => setMedia((prev) => prev.filter((m) => m.url !== urlToRemove))}
                  />
                ))
              )}
          </article>
        </section>
      </div>
    </main>
  );
}