export type ChatMessage = {
  username: string;
  message: string;
  badges?: string;      // e.g. "moderator/1,subscriber/12"
  color?: string;       // Twitch user color for username
  displayName?: string; // nicer display name if provided
};

const badgeIcons: Record<string, string> = {
  moderator: "⚔️",
  subscriber: "✨",
  vip: "💎",
  broadcaster: "📢",
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