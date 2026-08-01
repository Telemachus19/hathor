import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

export interface GameCarouselProps {
  s?: any;
  device?: 'desktop' | 'tablet' | 'mobile';
  pageSettings?: any;
}

const HATHOR_ORANGE = '#f26b21';

function isMediaVideo(item: any): boolean {
  if (!item) return false;
  if (typeof item === 'object') {
    if (item.type === 'video') return true;
    const url = item.url || item.src || '';
    return !!(
      url.match(/\.(mp4|webm|ogg|mov)$/i) ||
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('vimeo.com')
    );
  }
  if (typeof item === 'string') {
    return !!(
      item.match(/\.(mp4|webm|ogg|mov)$/i) ||
      item.includes('youtube.com') ||
      item.includes('youtu.be') ||
      item.includes('vimeo.com')
    );
  }
  return false;
}

function getMediaUrl(item: any): string {
  if (!item) return '';
  if (typeof item === 'object') return item.url || item.src || '';
  return String(item);
}

function getMediaPoster(item: any): string {
  if (typeof item === 'object' && item.poster) return item.poster;
  return '';
}

function RenderMediaContent({ item, style }: { item: any; style?: React.CSSProperties }) {
  const url = getMediaUrl(item);
  const isVideo = isMediaVideo(item);
  const poster = getMediaPoster(item);

  if (!url) return null;

  if (isVideo) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let embedUrl = url;
      const match = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
      );
      if (match && match[1]) {
        embedUrl = `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}`;
      }
      return (
        <iframe
          src={embedUrl}
          title="Video Playback"
          style={{ width: '100%', height: '100%', border: 'none', background: '#0a0d14', ...style }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    return (
      <video
        src={url}
        poster={poster || undefined}
        controls
        autoPlay
        muted
        loop
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#0a0d14', ...style }}
      />
    );
  }

  return (
    <img
      src={url}
      alt=""
      style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#0a0d14', ...style }}
    />
  );
}

export const GameCarousel: React.FC<GameCarouselProps> = ({ s = {}, device = 'desktop' }) => {
  const [idx, setIdx] = useState(0);
  const mediaItems = s.carouselImages || s.mediaItems || [
    { type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop' },
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
  ];
  const h = device === 'mobile' ? 240 : device === 'tablet' ? 360 : (s.carouselHeight || 420);
  const showThumbnails = s.showThumbnails ?? true;

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', marginBottom: 20 }}>
      <div style={{ position: 'relative', height: h, overflow: 'hidden', borderRadius: s.carouselRadius || 4, background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {mediaItems.length > 0 ? (
          <>
            <RenderMediaContent item={mediaItems[idx]} />
            {mediaItems.length > 1 && (
              <>
                <button onClick={() => setIdx((i) => (i - 1 + mediaItems.length) % mediaItems.length)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', padding: '8px 12px', cursor: 'pointer', zIndex: 10 }}>
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setIdx((i) => (i + 1) % mediaItems.length)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', padding: '8px 12px', cursor: 'pointer', zIndex: 10 }}>
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </>
        ) : null}
      </div>

      {showThumbnails && mediaItems.length > 1 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto' }}>
          {mediaItems.map((item: any, i: number) => {
            const url = getMediaUrl(item);
            const isVideo = isMediaVideo(item);
            const poster = getMediaPoster(item);

            return (
              <button key={i} onClick={() => setIdx(i)} style={{ width: 100, height: 60, borderRadius: 3, overflow: 'hidden', border: i === idx ? `2px solid ${HATHOR_ORANGE}` : '2px solid transparent', opacity: i === idx ? 1 : 0.6, cursor: 'pointer', padding: 0, flexShrink: 0, position: 'relative' }}>
                {isVideo ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0e1116' }}>
                    {poster ? <img src={poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: HATHOR_ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Play size={9} fill="#ffffff" color="#ffffff" style={{ marginLeft: 1 }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
