import React from 'react';
import {type FrontendMessage, badgeIcons, getFallbackColor } from "../models/Chat";

const parseBadges = (badgesStr?: string): string[] => {
  if (!badgesStr) return [];
  return badgesStr.split(",").map((badge) => badge.split("/")[0]);
}

const convertUrlsToLinks = (text: string) => {
  // Regular expression to find URLs starting with http:// or https://
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Replace found URLs with an anchor tag
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="background-color:blue">${url}</a>`;
  });
}

const TwitchChat: React.FC<{msg: FrontendMessage }> = ({ msg }) => {
    const { username, message, badges, color, displayName } = msg;
    const badgeList = parseBadges(badges);
    const newMsg = convertUrlsToLinks(message);

    if(msg.type === 'system') return

    return (
        <div className="flex items-center space-x-1">
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
            <span className={`font-semibold`} style={{ color: color || getFallbackColor(username) }}>
              {(() => {
                console.log(color ? color : "no color");
                return null;
              })()}
            {displayName || username}:
            </span>
            <span className="text-neutral-100 ps-1" dangerouslySetInnerHTML={{ __html: newMsg }}> 
            {/* Important: No children here */}
            </span>
        </span>
        </div>
    );
}

export default TwitchChat;