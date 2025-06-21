interface ChatMessage {
  type: 'chat';
  username: string;
  message: string;
  badges?: string;      // e.g. "moderator/1,subscriber/12"
  color?: string;       // Twitch user color for username
  displayName?: string; // nicer display name if provided
};

interface SysMessage {
	type: 'system'; // Discriminator property
  username: string;
	message: string; // The main message content from the line.match
	msgId: string; // From sysTags['msg-id']
	sysMsg: string; // From sysTags['system-msg']
	color: string;
	badges: string;
	displayName: string; // Display name for user notices (e.g., cheer, sub)
}

export type FrontendMessage = ChatMessage | SysMessage;

export interface MediaItem {
  url: string;
  displayName: string; // The display name of the user who sent the link
  message: string;     // The full chat message containing the link
}

const badgeIcons: Record<string, string> = {
  moderator: "⚔️",
  subscriber: "✨",
  vip: "💎",
  broadcaster: "🎥",
  announcement: "📢",
};

const fallbackColors = [
  "#e57373", // red
  "#64b5f6", // blue
  "#81c784", // green
  "#ffb74d", // orange
  "#ba68c8", // purple
]

function getFallbackColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % fallbackColors.length;
  return fallbackColors[index];
}

export { badgeIcons, getFallbackColor };