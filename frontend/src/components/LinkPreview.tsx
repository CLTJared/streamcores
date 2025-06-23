import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface LinkPreviewProps {
  url: string;
  submitter?: string;
  onRemove?: (url: string) => void;
}

interface PreviewData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const LinkPreview: React.FC<LinkPreviewProps> = ({ url, submitter, onRemove }) => {
  const [preview, setPreview] = useState<PreviewData | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      if (url.includes('x.com') || url.includes('twitter.com')) {
        setPreview(null);
        return;
      }

      try {
        const res = await axios.get('http://localhost:3001/api/preview', {
          params: { url },
        });
        setPreview(res.data);
      } catch (err) {
        console.error('Error fetching preview:', err);
        setPreview(null);
      }
    };

    fetchPreview();
  }, [url]);

  if (!preview) return (
    <div className="inline-block border-b-1 border-neutral-300 mb-2">
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex flex-row max-w-md"
      onClick={(e) => {
        e.preventDefault();      // prevent normal link navigation
        onRemove?.(url);         // call remove callback
        window.open(url, "_blank"); // then open link manually
      }}
    >
      <p className="inline-block text-xs font-semibold overflow-y-ellipsis max-h-sm">
      {(() => {
        try {
          if (url.includes('x.com/') || url.includes('twitter.com/')) {
            const tempURL = new URL(url.includes('://') ? url : 'https://' + url); // Default to https
            const parts = tempURL.pathname.split('/');
            if (parts[1]) {
              return `${tempURL.hostname}/${parts[1]}`; // Returns x.com/username/
            } else {
              return `${tempURL.hostname}/`; // Fallback
            }
          } else {
            const tempURL = new URL(url.includes('://') ? url : 'http://' + url);
            return `${tempURL.hostname}`;
          }
        } catch {
          return url;
        }
      })()}
      </p>
    </a>
    <p className="mb-2 text-xs text-neutral-700 grow">
      Shared by: <span className="font-semibold text-ellipsis text-blue-700">{submitter}</span>
    </p>
    </div>
  );

  return (
    <div className="inline-block border-b-1 border-neutral-300 mb-2">
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex flex-row max-w-md"
        onClick={(e) => {
          e.preventDefault();      // prevent normal link navigation
          onRemove?.(url);         // call remove callback
          window.open(url, "_blank"); // then open link manually
        }}
      >
      {preview.image && (
        <img src={preview.image} alt={preview.title || 'preview'} className="max-w-15 max-h-15 object-cover rounded mb-2 me-1" />
      )}
      <p className="inline-block text-xs font-semibold overflow-y-ellipsis max-h-sm">{preview.title}</p>
    </a>
    <p className="mb-2 text-xs text-neutral-700 grow">
      Shared by: <span className="font-semibold  text-blue-700">{submitter}</span>
    </p>
    </div>
  );
};

export default LinkPreview;