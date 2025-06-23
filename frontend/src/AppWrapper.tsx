import { useCallback, useEffect, useState } from "react";
import App from "@/App";
import TwitchEventListener from "@/components/TwitchEventListener";
import { useTwitchAuth } from "@/hooks/useTwitchAuth";
import { type FrontendMessage, type MediaItem } from "@/models/Message";
import { ToastContainer } from "@/components/Toast";

const extractUrls = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

export default function AppWrapper() {
  const { accessToken } = useTwitchAuth();
  const [channel, setChannel] = useState("");
  const [status, setStatus] = useState("");
  const [messages, setMessages] = useState<FrontendMessage[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const onMessage = useCallback((msg: FrontendMessage) => {
    setMessages((prev) => [...prev, msg].slice(-200));

    const urls = extractUrls(msg.message);
    if (urls.length) {
      setMedia((prev) => {
        const newMediaItems = urls.map((url) => ({
          url,
          displayName: msg.displayName ?? "",
          message: msg.message,
        }));

        const combined = [...prev, ...newMediaItems];

        const unique = combined.filter(
          (item, idx, arr) => arr.findIndex((i) => i.url === item.url) === idx
        );

        return unique.slice(-50);
      });
    }
  }, []);

  useEffect(() => {
    if (!channel || !accessToken) return;

    const connectToChannel = async () => {
      try {
        // Your backend connect POST
        const res = await fetch("http://localhost:3001/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel, accessToken }),
        });

        const data = await res.json();
        if (data.error) {
          setStatus(`Error: ${data.error}`);
          return;
        }

        setStatus(``);
        setMessages([]);
        setMedia([]);

        // Fetch Users ID #
          const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${channel}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Client-ID': import.meta.env.VITE_TWITCH_CLIENT_ID,
            },
          });

          const userData = await userRes.json();
          const userId = userData.data[0]?.id;
          if (!userId) return null;

        // Fetch stream title
        const streamRes = await fetch(
          `https://api.twitch.tv/helix/channels?broadcaster_id=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Client-ID": import.meta.env.VITE_TWITCH_CLIENT_ID,
            },
          }
        );

        const streamData = await streamRes.json();
        const category = streamData.data?.[0]?.game_name;
        const title = streamData.data?.[0]?.title;
          if (title) setStatus(`${category} - ${title}`);
      } catch (err) {
        console.error("Error connecting to channel:", err);
        setStatus("Error connecting");
      }
    };

    connectToChannel();
  }, [channel, accessToken, userId]);


  useEffect(() => {
    if (!accessToken) {
      setUserId(null);
      return;
    }

    const fetchUserId = async () => {
      try {
        const res = await fetch(
          `https://api.twitch.tv/helix/users`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Client-ID": import.meta.env.VITE_TWITCH_CLIENT_ID,
            },
          }
        );
        const data = await res.json();
        setUserId(data.data?.[0]?.id ?? null);
      } catch {
        setUserId(null);
      }
    };

    fetchUserId();
  }, [accessToken]); // only when accessToken changes


  const handleConnect = (newChannel: string) => {
    setChannel(newChannel.trim().toLowerCase());
    setMessages([]); // clear chat when joining new channel
  };

  return (
    <>
      <TwitchEventListener
        channel={channel}
        accessToken={accessToken}
        onMessage={onMessage}
        setUserId={setUserId}
      />
      <App
        channel={channel}
        setChannel={setChannel}  // to update input field state in Header
        messages={messages}
        setMessages={setMessages}
        onConnect={handleConnect}
        status={status}
        media={media}
        setMedia={setMedia}
        userId={userId}
      />
      <ToastContainer />
    </>
  );
}