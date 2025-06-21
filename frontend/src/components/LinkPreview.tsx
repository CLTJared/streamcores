import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface LinkPreviewProps {
  url: string;
  submitter?: string;
}

interface PreviewData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const LinkPreview: React.FC<LinkPreviewProps> = ({ url, submitter }) => {
  const [preview, setPreview] = useState<PreviewData | null>(null);

  useEffect(() => {

    if(submitter?.toLowerCase() === 'fossabot') return;

    const fetchPreview = async () => {
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
    <div className="border-b-1 border-neutral-300 mb-2">
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-row max-w-md">
      <p className="text-xs font-semibold">
      {(() => {
        try {
          if (url.includes('x.com/')) {
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
    <div className="border-b-1 border-neutral-300 mb-2 pe-2">
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-row max-w-md">
      {preview.image && (
        <img src={preview.image} alt={preview.title || 'Preview'} className="w-15 h-15 object-cover rounded mb-2 me-1" />
      )}
      <p className="text-xs font-semibold text-pretty">{preview.title}</p>
    </a>
    <p className="mb-2 text-xs text-neutral-700 grow">
      Shared by: <span className="font-semibold text-ellipsis text-blue-700">{submitter}</span>
    </p>
    </div>
  );
};

export default LinkPreview;