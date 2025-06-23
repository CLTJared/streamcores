import { useEffect, useRef } from "react";
import { type FrontendMessage, type TwitchEventListenerProps } from "@/models/Message";
import { useToast } from "@/hooks/useToast";

export default function TwitchEventListener({ accessToken, channel, onMessage }: TwitchEventListenerProps) {
  const socketRef = useRef<WebSocket | null>(null);
  const { addToast } = useToast();

  useEffect(() => {

    console.log("useEffect in TwitchEventListener, channel:", channel);

    if (!accessToken) {
      console.log("No access token, skipping WS connect");
      return;
    }
    if (!channel.trim()) {
      console.log("No channel set, skipping WS connect");
      return;
    }

    console.log(`Opening WebSocket connection for channel: ${channel}`);

    const socket = new WebSocket("ws://localhost:3001");

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      // Send join command to backend for this channel
      console.log("Sending JOIN for channel:", channel);
      socket.send(JSON.stringify({ type: "JOIN", channel }));
    };

    socket.onmessage = (event) => {
      try {
        const msg: FrontendMessage = JSON.parse(event.data);

        // Handle system messages with toast
        if (msg.type === "system") {
          const toastTitle = msg.msgId
            ? `${msg.msgId}: ${msg.displayName}`
            : msg.displayName;
          addToast(msg.message, toastTitle, "info");
          return;
        }

        // Forward chat messages
        if (msg.type === "chat") {
          onMessage(msg);
        }
      } catch (err) {
        console.warn("Failed to parse WS message:", err);
      }
    };

    socket.onclose = (e) => {
      console.log("WebSocket closed", e.reason);
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    // Cleanup on unmount or when dependencies change
    return () => {
      console.log("Closing WebSocket connection");
      socket.close();
      socketRef.current = null;
    };
  }, [accessToken, channel, onMessage, addToast]);

  return null;
}