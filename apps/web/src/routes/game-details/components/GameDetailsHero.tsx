import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Maximize2, X, Play } from 'lucide-react';

export interface GameDetailsHeroProps {
  s?: any;
  images?: string[];
  device?: 'desktop' | 'tablet' | 'mobile';
}

const HATHOR_ORANGE = '#f26b21';
const BG = '#212631';
const SURFACE = '#181c24';

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

export const GameDetailsHero: React.FC<GameDetailsHeroProps> = ({ s = {}, images, device = 'desktop' }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isLightbox, setIsLightbox] = useState(false);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const mediaItems = s.heroImages || s.mediaItems || s.media || images || [
    { type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop' },
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1200&auto=format&fit=crop',
  ];

  useEffect(() => {
    if (thumbRefs.current[activeIdx]) {
      thumbRefs.current[activeIdx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeIdx]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIdx((i) => (i > 0 ? i - 1 : mediaItems.length - 1));
  };
  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIdx((i) => (i < mediaItems.length - 1 ? i + 1 : 0));
  };

  const responsiveHeroHeight = device === 'mobile' ? Math.min(s.heroHeight || 480, 260) : device === 'tablet' ? Math.min(s.heroHeight || 480, 360) : (s.heroHeight || 480);
  const thumbWidth = device === 'mobile' ? 110 : device === 'tablet' ? 140 : 180;
  const thumbHeight = device === 'mobile' ? 60 : device === 'tablet' ? 80 : 100;
  const showThumbnails = s.showThumbnails ?? true;
  const heroShadowEnabled = s.heroShadowEnabled ?? true;
  const heroShadowColor = s.heroShadowColor || '#212631';

  return (
    <div style={{ width: '100%', background: BG, position: 'relative' }}>
      <div
        style={{ position: 'relative', width: '100%', height: responsiveHeroHeight, overflow: 'hidden', cursor: 'pointer', transition: 'height 0.25s ease', background: '#0a0d14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => setIsLightbox(true)}
      >
        <RenderMediaContent item={mediaItems[activeIdx]} />
        {heroShadowEnabled && heroShadowColor !== 'transparent' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(to bottom, transparent 0%, ${heroShadowColor}77 65%, ${heroShadowColor} 100%)`,
              pointerEvents: 'none',
            }}
          />
        )}

        <div style={{ position: 'absolute', bottom: device === 'mobile' ? 10 : 20, right: device === 'mobile' ? 12 : 24, background: 'rgba(14, 17, 22, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: device === 'mobile' ? 6 : 10, borderRadius: 4, display: 'flex', backdropFilter: 'blur(4px)' }}>
          <Maximize2 size={device === 'mobile' ? 12 : 16} />
        </div>

        <button onClick={handlePrev} style={{ position: 'absolute', left: device === 'mobile' ? 8 : 24, top: '50%', transform: 'translateY(-50%)', width: device === 'mobile' ? 32 : 44, height: device === 'mobile' ? 32 : 44, background: 'rgba(33, 38, 49, 0.75)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: 2, zIndex: 10 }}>
          <ChevronLeft size={device === 'mobile' ? 16 : 20} />
        </button>
        <button onClick={handleNext} style={{ position: 'absolute', right: device === 'mobile' ? 8 : 24, top: '50%', transform: 'translateY(-50%)', width: device === 'mobile' ? 32 : 44, height: device === 'mobile' ? 32 : 44, background: 'rgba(33, 38, 49, 0.75)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: 2, zIndex: 10 }}>
          <ChevronRight size={device === 'mobile' ? 16 : 20} />
        </button>
      </div>

      {showThumbnails && (
        <div style={{ maxWidth: 1280, margin: device === 'mobile' ? '-1.5rem auto 0' : '-3rem auto 0', position: 'relative', zIndex: 5, padding: device === 'mobile' ? '0 12px' : '0 24px' }}>
          <div style={{ display: 'flex', gap: device === 'mobile' ? 8 : 16, overflowX: 'auto', paddingBottom: device === 'mobile' ? 8 : 12 }}>
            {mediaItems.map((item: any, idx: number) => {
              const url = getMediaUrl(item);
              const isVideo = isMediaVideo(item);
              const poster = getMediaPoster(item);

              return (
                <button
                  key={idx}
                  ref={(el) => { thumbRefs.current[idx] = el; }}
                  onClick={(e) => { e.stopPropagation(); setActiveIdx(idx); }}
                  style={{ width: thumbWidth, height: thumbHeight, flexShrink: 0, borderRadius: 4, overflow: 'hidden', border: idx === activeIdx ? `2px solid ${HATHOR_ORANGE}` : '2px solid transparent', opacity: idx === activeIdx ? 1 : 0.7, cursor: 'pointer', background: SURFACE, padding: 0, position: 'relative' }}
                >
                  {isVideo ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0e1116' }}>
                      {poster ? (
                        <img src={poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: HATHOR_ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                          <Play size={11} fill="#ffffff" color="#ffffff" style={{ marginLeft: 1 }} />
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
        </div>
      )}

      {isLightbox && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999999, background: 'rgba(10, 12, 16, 0.95)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }} onClick={() => setIsLightbox(false)}>
          <div style={{ position: 'absolute', top: 24, left: 32, right: 32, display: 'flex', justifyContent: 'space-between', color: '#fff', zIndex: 10 }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14 }}>MEDIA {activeIdx + 1} OF {mediaItems.length}</span>
            <button onClick={() => setIsLightbox(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: 8, cursor: 'pointer', borderRadius: 4 }}>
              <X size={18} />
            </button>
          </div>
          <button onClick={handlePrev} style={{ position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)', background: 'rgba(20,24,32,0.85)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', width: 50, height: 50, borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <ChevronLeft size={24} />
          </button>
          <div style={{ maxWidth: '90vw', maxHeight: '82vh', width: '100%', height: '82vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
            <RenderMediaContent item={mediaItems[activeIdx]} />
          </div>
          <button onClick={handleNext} style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', background: 'rgba(20,24,32,0.85)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', width: 50, height: 50, borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <ChevronRight size={24} />
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};
