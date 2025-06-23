import React, { useState, type FC } from 'react';
import {type FrontendMessage, getFallbackColor } from "@/models/Message";
import { badgeIcons } from '@/models/Badges'

interface ImageFallbackProps {
  src: string;
  alt?: string;
  className?: string;
}

const parseBadges = (badgesStr?: string): string[] => {
  if (!badgesStr) return [];
  return badgesStr.split(",").map((badge) => badge.split("/")[0]);
}
 
const escapeHTML = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

const ImageFallback: FC<ImageFallbackProps> = ({ src, alt = '', className }) => {
  const [isValid, setIsValid] = useState(true);

  if (!isValid) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setIsValid(false)}
    />
  );
};

const processMessage = (text: string, channel: string) => {
  const safeText = escapeHTML(text);
  const channelTag = `@${channel.toLowerCase()}`;
  const words = safeText.split(/(\s+)/); // keep spaces

  const highlighted = words.map((word) => {
    if (word.toLowerCase() === channelTag) {
      return `<mark>${word}</mark>`;
    }
    return word;
  }).join('');

  // Finally, convert URLs to <a> tags
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return highlighted.replace(urlRegex, (url) => {
    return `<a data-name="chat-link" href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
};

const TwitchChat: React.FC<{msg: FrontendMessage, channel: string, index: number }> = ({ msg, channel, index }) => {
    const { username, message, badges, color, displayName } = msg;
    const badgeList = parseBadges(badges);
    const bgColorClass = index % 2 === 0 ? 'bg-slate-950' : 'bg-gray-950';

    if(msg.type === 'system') return null;

    return (
        <div data-name="chat-msg" className={`flex items-center pb-1 px-2 space-x-1 hover:bg-purple-950 ${ bgColorClass }`}>
        <span>
          {badgeList.map((badge) => {
            const custom = badgeIcons[badge]?.[0]; // Safe lookup
            if (!custom) return null;

            const safeUrl = custom.image.endsWith('/1') 
                          || custom.image.endsWith('/2') 
                          || custom.image.endsWith('/3')
            ? custom.image
            : custom.image + '/1';


            return (
              <span key={badge} className="inline-block select-none text-sm">
                <ImageFallback
                  src={`http://localhost:3001/api/img-proxy?url=${encodeURIComponent(safeUrl)}`}
                  alt={custom.title}
                  className="inline-block w-4 h-4 me-1 align-middle select-none"
                />
              </span>
            );
          })}
            <span className={`font-semibold`} style={{ color: color || getFallbackColor(username) }}>
            {displayName || username}:
            </span>
            <span className="text-neutral-100 ps-1 items-center" dangerouslySetInnerHTML={{ __html: processMessage(message, channel) }}> 
            {/* Important: No children here */}
            </span>
        </span>
        </div>
    );
}

export default TwitchChat;