import { ChevronUp, ChevronDown, Trash2, Copy, Layers } from 'lucide-react';
import { Section, Device, PageSettings } from '../../types/designerTypes';
import { BLOCK_META } from '../sidebar/paletteConfig';
import { GridRenderer } from './GridRenderer';
import {
  GameDetailsHeader,
  GameOwnershipBanner,
  GameAbout,
  GameSystemReqs,
  GameReviews,
  GameSidebarCta,
  GameSidebarInfo,
  GameSidebarRatings,
  GameSidebarCommunity,
  MoreLikeThis,
  GameCarousel,
  GameFeatures,
  GameTwoCol,
  GameCtaBlock,
  HeadingRenderer,
  TextRenderer,
  ImageRenderer,
  ButtonRenderer,
  DividerRenderer,
  SpacerRenderer,
} from '../../../game-details/components';
import styles from '../../DesignerPage.module.css';

export function SectionWrapper({
  section: s,
  device,
  pageSettings,
  selected,
  selectedColIdx,
  selectedElementId,
  isFirst,
  isLast,
  onSelect,
  onSelectChild,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: {
  section: Section;
  device: Device;
  pageSettings?: PageSettings;
  selected: boolean;
  selectedColIdx?: number | null;
  selectedElementId?: string | null;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onSelectChild?: (colIdx: number, elementId: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const responsivePt = device === 'mobile' ? Math.min(s.pt, 20) : s.pt;
  const responsivePb = device === 'mobile' ? Math.min(s.pb, 24) : s.pb;
  const leftPad = s.pl ?? s.ph ?? 0;
  const rightPad = s.pr ?? s.ph ?? 0;
  const responsivePl =
    device === 'mobile'
      ? Math.min(leftPad, 16)
      : device === 'tablet'
        ? Math.min(leftPad, 24)
        : leftPad;
  const responsivePr =
    device === 'mobile'
      ? Math.min(rightPad, 16)
      : device === 'tablet'
        ? Math.min(rightPad, 24)
        : rightPad;

  return (
    <div
      className={`${styles.sectionWrapper} ${selected ? styles.sectionSelected : ''}`}
      style={{
        backgroundColor: s.bg || 'transparent',
        backgroundImage: s.bgImage ? `url("${s.bgImage}")` : undefined,
        backgroundSize: s.bgSize || 'cover',
        backgroundPosition: s.bgPosition || 'center center',
        backgroundRepeat: s.bgRepeat || 'no-repeat',
        borderTop: s.borderTopColor ? `2px solid ${s.borderTopColor}` : 'none',
        marginBottom: s.mb ?? 32,
        position: 'relative',
      }}
    >
      {/* Background Image Overlay Tint */}
      {s.bgImage && (s.bgOverlay || s.bgOverlayOpacity !== undefined) && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: s.bgOverlay || 'rgba(0,0,0,0.5)',
            opacity: s.bgOverlayOpacity ?? 0.5,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* Floating Outer Section Handle Badge */}
      <div
        className={styles.sectionHandleBadge}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <Layers size={11} />
        <span>Section: {BLOCK_META[s.type]?.label}</span>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          paddingTop: responsivePt,
          paddingBottom: responsivePb,
          paddingLeft: responsivePl,
          paddingRight: responsivePr,
          borderRadius: s.radius,
          boxSizing: 'border-box',
        }}
      >
        {(s.type === 'game-hero' || s.type === 'media-carousel' || s.type === 'carousel') && (
          <GameCarousel s={s as any} device={device} pageSettings={pageSettings} />
        )}
        {s.type === 'game-header' && (
          <GameDetailsHeader s={s} device={device} pageSettings={pageSettings} />
        )}
        {s.type === 'ownership-banner' && <GameOwnershipBanner s={s} device={device} />}
        {s.type === 'about-game' && <GameAbout s={s} device={device} pageSettings={pageSettings} />}
        {s.type === 'system-reqs' && (
          <GameSystemReqs s={s} device={device} pageSettings={pageSettings} />
        )}
        {s.type === 'user-reviews' && (
          <GameReviews s={s} device={device} pageSettings={pageSettings} />
        )}
        {s.type === 'sidebar-cta' && (
          <GameSidebarCta s={s} device={device} pageSettings={pageSettings} />
        )}
        {s.type === 'sidebar-info' && (
          <GameSidebarInfo s={s} device={device} pageSettings={pageSettings} />
        )}
        {s.type === 'sidebar-ratings' && (
          <GameSidebarRatings s={s} device={device} pageSettings={pageSettings} />
        )}
        {s.type === 'sidebar-community' && (
          <GameSidebarCommunity s={s} device={device} pageSettings={pageSettings} />
        )}
        {s.type === 'recommendations' && (
          <MoreLikeThis s={s} device={device} pageSettings={pageSettings} />
        )}
        {s.type === 'heading' && (
          <HeadingRenderer s={s} device={device} pageSettings={pageSettings} />
        )}
        {s.type === 'text' && <TextRenderer s={s} device={device} pageSettings={pageSettings} />}
        {s.type === 'image' && <ImageRenderer s={s} />}
        {s.type === 'button' && <ButtonRenderer s={s} />}
        {s.type === 'features' && (
          <GameFeatures s={s} device={device} pageSettings={pageSettings} />
        )}
        {s.type === 'two-col' && <GameTwoCol s={s} device={device} pageSettings={pageSettings} />}
        {s.type === 'grid' && (
          <GridRenderer
            s={s}
            device={device}
            selectedColIdx={selectedColIdx}
            selectedElementId={selectedElementId}
            onSelectChild={onSelectChild}
            pageSettings={pageSettings}
          />
        )}
        {s.type === 'divider' && <DividerRenderer s={s} />}
        {s.type === 'spacer' && <SpacerRenderer s={s} />}
        {s.type === 'cta' && <GameCtaBlock s={s} device={device} pageSettings={pageSettings} />}
      </div>

      {/* Controls toolbar */}
      {selected && (
        <div className={styles.sectionToolbar}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={isFirst}
            className={styles.sectionToolBtn}
            title="Move up"
          >
            <ChevronUp size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={isLast}
            className={styles.sectionToolBtn}
            title="Move down"
          >
            <ChevronDown size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className={styles.sectionToolBtn}
            title="Duplicate"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className={styles.sectionToolBtn}
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
