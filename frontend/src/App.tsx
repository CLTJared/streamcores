import { useEffect, useState } from "react";
import { type FrontendMessage, type MediaItem } from "@/models/Chat";
import Header from "@/components/Header";
import Button from "@/components/Button";
import { Route, Routes } from "react-router-dom";
import Auth from "./callback/Auth";
import LinkPreview from "@/components/LinkPreview";
import TwitchChat from "@/components/TwitchChat";

interface Props {
  accessToken: string | null;
  isAuthenticated: boolean;
  logout: () => void;
  channel: string;
  setChannel: React.Dispatch<React.SetStateAction<string>>;
  messages: FrontendMessage[];
  setMessages: React.Dispatch<React.SetStateAction<FrontendMessage[]>>;
}

function App({ accessToken,
  isAuthenticated,
  logout,
  channel,
  setChannel,
  messages,
  setMessages, }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [follows, setFollows] = useState<{ user_name: string; user_id: string }[]>([]);

  const extractUrls = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  const handleConnect = async (custChannel?: string) => {
    const internalChannel = custChannel ?? channel;
    if (!internalChannel.trim() || !accessToken) return;

    try {
      const res = await fetch("http://localhost:3001/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: internalChannel, accessToken }),
      });
      const data = await res.json();
      if (data.error) {
        setStatus(`Error: ${data.error}`);
        return;
      }

      setStatus(`#${data.channel}`);
      setMessages([]);
      setMedia([]);

      const userRes = await fetch(
        `https://api.twitch.tv/helix/users?login=${internalChannel}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": import.meta.env.VITE_TWITCH_CLIENT_ID,
          },
        }
      );
      const userData = await userRes.json();
      const fetchedId = userData.data?.[0]?.id;
      if (fetchedId) {
        setUserId(fetchedId);
        const streamRes = await fetch(
          `https://api.twitch.tv/helix/streams?user_id=${fetchedId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Client-ID": import.meta.env.VITE_TWITCH_CLIENT_ID,
            },
          }
        );
        const streamData = await streamRes.json();
        const title = streamData.data?.[0]?.title;
        if (title) {
          setStatus((prev) => `${prev} — "${title}"`);
        }
      }
    } catch (err) {
      console.error("Error connecting to channel:", err);
      setStatus("Error connecting");
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    fetch("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-ID": import.meta.env.VITE_TWITCH_CLIENT_ID,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        const id = data?.data?.[0]?.id;
        if (id) setUserId(id);
      })
      .catch((e) => console.error(e));
  }, [accessToken]);

  useEffect(() => {
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
        setFollows(followData.data || []);
      } catch (e) {
        console.error("Failed to fetch follows:", e);
      }
    };
    loadFollows();
    const iv = setInterval(loadFollows, 30_000);
    return () => clearInterval(iv);
  }, [accessToken, userId]);

  useEffect(() => {
    const uniqueMedia = messages
      .flatMap((msg) =>
        extractUrls(msg.message).map((url) => ({
          url,
          displayName: msg.displayName ?? "",
          message: msg.message,
        }))
      )
      .filter((item, idx, arr) => arr.findIndex((i) => i.url === item.url) === idx)
      .slice(0, 50);
    setMedia(uniqueMedia);
  }, [messages]);

  return (
    <main className="min-w-10 m-2">
      <Header channel={channel} setChannel={setChannel} onConnect={handleConnect} />
      <div className="my-2 ms-2">
        <Routes>
          <Route path="/callback/auth" element={<Auth />} />
          <Route
            path="/"
            element={
              <Button className="bg-purple-500 hover:bg-purple-600 text-neutral-50" onClick={() => {
                if (isAuthenticated) logout();
                else {
                  const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
                  const redirectUri = encodeURIComponent("http://localhost:5173/callback/auth");
                  const scopes = encodeURIComponent("chat:read user:read:follows");
                  window.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}`;
                }
              }}>
                {isAuthenticated ? "Logout" : "Login with Twitch"}
              </Button>
            }
          />
        </Routes>
      </div>
      <div className="flex">
        <aside className="p-4">
          <h3>Online: {follows.length}</h3>
          <div className="bg-slate-950 text-neutral-50 max-h-[600px] overflow-y-auto rounded">
            {follows.map((f) => (
              <p
                key={f.user_id}
                className="cursor-pointer hover:bg-slate-700 ps-2 pe-4 py-1"
                onClick={() => handleConnect(f.user_name)}
              >
                {f.user_name}
              </p>
            ))}
          </div>
        </aside>
        <section className="p-4 grow">
          <span>{status || "Twitch Chat"}</span>
          <div className="bg-slate-950 p-4 rounded h-[600px] overflow-y-auto flex flex-col-reverse leading-7">
            {messages.length === 0 ? (
              <p className="italic text-neutral-50">No messages yet...</p>
            ) : (
              messages.map((msg, idx) => <TwitchChat key={idx} msg={msg} />)
            )}
          </div>
        </section>
        <section className="py-4 min-w-50 w-50">
          <h3>Stream Media (URLs)</h3>
          <article className="h-[600px] overflow-y-auto overflow-x-hidden">
            {media.length === 0 ? (
              <p>No media URLs found yet.</p>
            ) : (
              media.map((item, i) => (
                <LinkPreview key={i} url={item.url} submitter={item.displayName} />
              ))
            )}
          </article>
        </section>
      </div>
    </main>
  );
}

export default App