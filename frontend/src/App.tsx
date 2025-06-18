import { useState, useEffect, useRef } from "react";
import {type ChatMessage, badgeIcons, getFallbackColor } from "./models/Chat";
import Header from "./components/Header"
import Button from "./components/Button"
import { useTwitchAuth } from "./context/TwitchAuthContext";
import { Route, Routes } from "react-router-dom";
import Auth from "./callback/Auth";

const parseBadges = (badgesStr?: string): string[] => {
  if (!badgesStr) return [];
  return badgesStr.split(",").map((badge) => badge.split("/")[0]);
}

function App() {
  const [channel, setChannel] = useState<string>("");
  const [status, setStatus] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const { isAuthenticated, login, logout } = useTwitchAuth();

  const handleConnect = async () => {
    if (!channel.trim()) return;

    try {
      const res = await fetch("http://localhost:3001/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel }),
      });

      const data = await res.json();

      if (data.error) {
        setStatus(`Error: ${data.error}`);
        return;
      }

      setStatus(`Connected to #${data.channel}`);
      setMessages([]); // Clear old messages when changing channels

      // Close existing WebSocket if any
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Open new WebSocket to backend
      const socket = new WebSocket("ws://localhost:3001");

      socket.onopen = () => {
        console.log("WebSocket connected");
      };

      socket.onmessage = (event) => {
        try {
          const msg: ChatMessage = JSON.parse(event.data);
          setMessages((prev) => {
            const newMsg = [...prev, msg];
            return newMsg.slice(-100)
          });
        } catch {
          console.warn("Invalid message received", event.data);
        }
      };

      socket.onclose = () => {
        console.log("WebSocket closed");
      };

      socket.onerror = (err) => {
        console.error("WebSocket error", err);
      };

      wsRef.current = socket;
    } catch (error) {
      console.error("Error connecting to channel:", error);
      setStatus("Error connecting");
    }
  };

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        setChannel('');
      }
    };
  }, []);

  return (
    <main className="min-w-10 m-2">
      <Header
        channel={channel}
        setChannel={setChannel}
        onConnect={handleConnect}
      />
      <Routes>
        <Route path='/callback/auth' element={<Auth />} />
      </Routes>
    <div className="my-2 ms-2">
      <Button
        type="button"
        onClick={() => {
          console.log("Button clicked");
          if (isAuthenticated) {
            console.log("Logging out");
            logout();
          } else {
            console.log("Attempting login with stored tokens");
            const storedAccess = localStorage.getItem("twitch_access_token");
            const storedRefresh = localStorage.getItem("twitch_refresh_token");
            const storedExpires = localStorage.getItem("twitch_expires_in");

            if (
              storedAccess &&
              storedRefresh &&
              storedExpires &&
              Number(storedExpires) > Date.now()
            ) {
              console.log("Attempting login with stored tokens");
              login(storedAccess, storedRefresh, (Number(storedExpires) - Date.now()) / 1000);
            } else {
              console.log("No valid tokens, redirecting to Twitch OAuth...");
              // redirect
              const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
              const redirectUri = encodeURIComponent("http://localhost:5173/callback/auth"); // your redirect URL
              const scopes = encodeURIComponent("chat:read user:read:follows"); // scopes you need
              const responseType = "code"; // for Authorization Code Flow

              const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scopes}`;

              window.location.href = authUrl;
            }
          }
        }}
        className="bg-purple-500"
      >
        {isAuthenticated ? "Logout" : "Login with Twitch"}
      </Button>
    </div>
    <section className="p-4 max-w-2xl mx-auto" id="chatarea">
      <h3 className="text-neutral-500 text-lg font-semibold mb-2">Twitch Chat - {status}</h3>
      <div className="bg-neutral-950 p-4 rounded overflow-y-auto max-h-[600px] flex flex-col-reverse">
        <div className="">
          {messages.length === 0 && (
            <p className="italic text-neutral-50">No messages yet...</p>
          )}
          {messages.map((msg, idx) => {
            const badgeList = parseBadges(msg.badges);
            return (
              <div key={idx} className="flex items-center space-x-1">
                <span>
                  {badgeList.map((badge) => (
                    <span
                      key={badge}
                      title={badge}
                      className="inline-block select-none text-sm"
                    >
                      {badgeIcons[badge] || null}
                    </span>
                  ))}
                  <span className="font-semibold" style={{ color: msg.color || getFallbackColor(msg.username) }}>
                    {msg.displayName || msg.username}:
                  </span>
                  <span className="text-neutral-100">&nbsp;{msg.message}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
    </main>
  );
}

export default App;