import React, { useState } from 'react';
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
} from '../routes/game-details/components';

const REVERSE_NAME_MAP: Record<string, string> = {
  GameHero: 'media-carousel',
  'game-hero': 'media-carousel',
  MediaCarousel: 'media-carousel',
  'media-carousel': 'media-carousel',
  MediaShowcase: 'media-carousel',
  CarouselShowcase: 'media-carousel',
  Carousel: 'media-carousel',
  carousel: 'media-carousel',
  GameHeader: 'game-header',
  'game-header': 'game-header',
  OwnershipBanner: 'ownership-banner',
  'ownership-banner': 'ownership-banner',
  AboutGame: 'about-game',
  'about-game': 'about-game',
  SystemReqs: 'system-reqs',
  'system-reqs': 'system-reqs',
  UserReviews: 'user-reviews',
  'user-reviews': 'user-reviews',
  SidebarCTA: 'sidebar-cta',
  'sidebar-cta': 'sidebar-cta',
  SidebarInfo: 'sidebar-info',
  'sidebar-info': 'sidebar-info',
  SidebarRatings: 'sidebar-ratings',
  'sidebar-ratings': 'sidebar-ratings',
  SidebarCommunity: 'sidebar-community',
  'sidebar-community': 'sidebar-community',
  Recommendations: 'recommendations',
  recommendations: 'recommendations',
  CustomGrid: 'grid',
  GridSection: 'grid',
  grid: 'grid',
  FeaturesGrid: 'features',
  features: 'features',
  TwoColumns: 'two-col',
  'two-col': 'two-col',
  CTABlock: 'cta',
  CTA: 'cta',
  cta: 'cta',
  HeadingBlock: 'heading',
  Heading: 'heading',
  heading: 'heading',
  TextBlock: 'text',
  Text: 'text',
  text: 'text',
  ImageBlock: 'image',
  Image: 'image',
  image: 'image',
  ButtonBlock: 'button',
  Button: 'button',
  button: 'button',
  Divider: 'divider',
  divider: 'divider',
  Spacer: 'spacer',
  spacer: 'spacer',
};

function normalizeNode(node: any): any {
  if (!node || typeof node !== 'object') return {};
  const rawComp = node.component || node.type || 'text';
  const type = REVERSE_NAME_MAP[rawComp] || rawComp;

  const children = node.children || {};
  const style = node.style || {};

  return {
    ...node,
    ...children,
    ...style,
    type,
    gridCols: children.gridCols || node.gridCols || [],
    gridTemplate: children.gridTemplate || node.gridTemplate || '1:1',
    gridGap: children.gridGap || node.gridGap || 24,
  };
}

function ComponentSectionWrapper({
  s,
  isTopLevel,
  children,
}: {
  s: any;
  isTopLevel?: boolean;
  children: React.ReactNode;
}) {
  if (!isTopLevel) {
    return (
      <div style={{ width: '100%', boxSizing: 'border-box', marginBottom: s.mb ?? 16 }}>
        {children}
      </div>
    );
  }

  const pt = s.pt ?? 0;
  const pb = s.pb ?? 0;
  const leftPad = s.pl ?? s.ph ?? 0;
  const rightPad = s.pr ?? s.ph ?? 0;
  const mb = s.mb ?? 32;

  const bgImage =
    s.bgImage ||
    s.section?.backgroundImage ||
    (s.style?.section?.backgroundImage
      ? s.style.section.backgroundImage.replace(/^url\(["']?|["']?\)$/g, '')
      : undefined);
  const bgSize =
    s.bgSize || s.section?.backgroundSize || s.style?.section?.backgroundSize || 'cover';
  const bgPosition =
    s.bgPosition ||
    s.section?.backgroundPosition ||
    s.style?.section?.backgroundPosition ||
    'center center';
  const bgRepeat =
    s.bgRepeat || s.section?.backgroundRepeat || s.style?.section?.backgroundRepeat || 'no-repeat';
  const bgAttachment =
    s.bgAttachment || s.section?.backgroundAttachment || s.style?.section?.backgroundAttachment;
  const bgOverlay = s.bgOverlay || s.section?.bgOverlay || s.style?.section?.bgOverlay;
  const bgOverlayOpacity =
    s.bgOverlayOpacity ?? s.section?.bgOverlayOpacity ?? s.style?.section?.bgOverlayOpacity;

  return (
    <div
      style={{
        backgroundColor: s.bg || s.section?.background || 'transparent',
        backgroundImage: bgImage ? `url("${bgImage}")` : undefined,
        backgroundSize: bgSize,
        backgroundPosition: bgPosition,
        backgroundRepeat: bgRepeat,
        backgroundAttachment: bgAttachment,
        borderTop: s.borderTopColor ? `2px solid ${s.borderTopColor}` : 'none',
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        paddingTop: pt,
        paddingBottom: pb,
        paddingLeft: leftPad,
        paddingRight: rightPad,
        marginBottom: mb,
        borderRadius: s.radius,
      }}
    >
      {bgImage && (bgOverlay || bgOverlayOpacity !== undefined) && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: bgOverlay || 'rgba(0,0,0,0.5)',
            opacity: bgOverlayOpacity ?? 0.5,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', boxSizing: 'border-box' }}>
        {children}
      </div>
    </div>
  );
}

function ComponentNodeContent({
  s,
  nodeKey,
  pageSettings,
}: {
  s: any;
  nodeKey: string | number;
  pageSettings?: any;
}) {
  const type = s.type;
  const device = s.device || pageSettings?.device;

  if (type === 'media-carousel' || type === 'carousel' || type === 'game-hero') {
    return <GameCarousel key={nodeKey} s={s} device={device} pageSettings={pageSettings} />;
  }
  if (type === 'game-header')
    return <GameDetailsHeader key={nodeKey} s={s} device={device} pageSettings={pageSettings} />;
  if (type === 'ownership-banner')
    return <GameOwnershipBanner key={nodeKey} s={s} device={device} pageSettings={pageSettings} />;
  if (type === 'about-game')
    return <GameAbout key={nodeKey} s={s} device={device} pageSettings={pageSettings} />;
  if (type === 'system-reqs')
    return <GameSystemReqs key={nodeKey} s={s} device={device} pageSettings={pageSettings} />;
  if (type === 'user-reviews')
    return <GameReviews key={nodeKey} s={s} device={device} pageSettings={pageSettings} />;
  if (type === 'sidebar-cta')
    return <GameSidebarCta key={nodeKey} s={s} device={device} pageSettings={pageSettings} />;
  if (type === 'sidebar-info')
    return <GameSidebarInfo key={nodeKey} s={s} device={device} pageSettings={pageSettings} />;
  if (type === 'sidebar-ratings')
    return <GameSidebarRatings key={nodeKey} s={s} device={device} pageSettings={pageSettings} />;
  if (type === 'sidebar-community')
    return <GameSidebarCommunity key={nodeKey} s={s} device={device} pageSettings={pageSettings} />;
  if (type === 'recommendations')
    return <MoreLikeThis key={nodeKey} s={s} device={device} pageSettings={pageSettings} />;
  if (type === 'features')
    return <GameFeatures key={nodeKey} s={s} device={device} pageSettings={pageSettings} />;
  if (type === 'two-col')
    return <GameTwoCol key={nodeKey} s={s} device={device} pageSettings={pageSettings} />;
  if (type === 'cta')
    return <GameCtaBlock key={nodeKey} s={s} device={device} pageSettings={pageSettings} />;
  if (type === 'heading')
    return <HeadingRenderer key={nodeKey} s={s} device={device} pageSettings={pageSettings} />;
  if (type === 'text')
    return <TextRenderer key={nodeKey} s={s} device={device} pageSettings={pageSettings} />;
  if (type === 'image') return <ImageRenderer key={nodeKey} s={s} />;
  if (type === 'button') return <ButtonRenderer key={nodeKey} s={s} pageSettings={pageSettings} />;
  if (type === 'divider') return <DividerRenderer key={nodeKey} s={s} />;
  if (type === 'spacer') return <SpacerRenderer key={nodeKey} s={s} />;

  if (type === 'grid' || s.gridCols) {
    const gridCols = s.gridCols || [];
    const templateStr = s.gridTemplate || '1:1';
    const gridGap = s.gridGap || 24;

    const colCount = gridCols.length || 2;
    const isMobileDevice = pageSettings?.device === 'mobile';

    let templateCss = `repeat(${colCount}, 1fr)`;
    if (templateStr === '2:1') templateCss = '2fr 1fr';
    if (templateStr === '1:2') templateCss = '1fr 2fr';
    if (templateStr === '1:2:1') templateCss = '1fr 2fr 1fr';

    if (isMobileDevice) {
      templateCss = '1fr';
    }

    return (
      <div
        key={nodeKey}
        className="hathor-pure-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: templateCss,
          gap: gridGap,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <style>{`
          @media (max-width: 900px) {
            .hathor-pure-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
        {gridCols.map((col: any, cIdx: number) => {
          const colStyle = col.style?.column || {};
          const colBg = colStyle.background || col.bg || 'transparent';
          const colElements = col.children ? Object.values(col.children) : col.elements || [];

          return (
            <div
              key={col.id || cIdx}
              style={{
                background: colBg,
                borderRadius: 4,
                padding: col.ph || 0,
                boxSizing: 'border-box',
                width: '100%',
                minWidth: 0,
              }}
            >
              {Array.isArray(colElements)
                ? colElements.map((el: any, eIdx: number) => (
                    <ComponentNodeRenderer
                      key={el.id || eIdx}
                      node={el}
                      nodeKey={`${nodeKey}-col${cIdx}-el${eIdx}`}
                      pageSettings={pageSettings}
                      isTopLevel={false}
                    />
                  ))
                : Object.entries(colElements).map(([elKey, elVal]) => (
                    <ComponentNodeRenderer
                      key={elKey}
                      node={elVal}
                      nodeKey={elKey}
                      pageSettings={pageSettings}
                      isTopLevel={false}
                    />
                  ))}
            </div>
          );
        })}
      </div>
    );
  }

  return <div key={nodeKey} />;
}

function ComponentNodeRenderer({
  node,
  nodeKey,
  pageSettings,
  isTopLevel = true,
}: {
  node: any;
  nodeKey: string | number;
  pageSettings?: any;
  isTopLevel?: boolean;
}) {
  const s = normalizeNode(node);
  return (
    <ComponentSectionWrapper s={s} isTopLevel={isTopLevel}>
      <ComponentNodeContent s={s} nodeKey={nodeKey} pageSettings={pageSettings} />
    </ComponentSectionWrapper>
  );
}

export const PureJsonNode: React.FC<{
  node: any;
  nodeKey: string | number;
  pageSettings?: any;
  isTopLevel?: boolean;
}> = ({ node, nodeKey, pageSettings, isTopLevel = true }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (node === null || node === undefined) return null;

  if (typeof node === 'string' || typeof node === 'number') {
    return <>{node}</>;
  }

  if (Array.isArray(node)) {
    return (
      <>
        {node.map((child, idx) => (
          <PureJsonNode
            key={`${nodeKey}-${idx}`}
            node={child}
            nodeKey={`${nodeKey}-${idx}`}
            pageSettings={pageSettings}
            isTopLevel={isTopLevel}
          />
        ))}
      </>
    );
  }

  if (typeof node === 'object') {
    if (node.component || node.type) {
      return (
        <ComponentNodeRenderer
          node={node}
          nodeKey={nodeKey}
          pageSettings={pageSettings}
          isTopLevel={isTopLevel}
        />
      );
    }

    const Tag = node.tag || 'div';

    const mergedStyle = {
      ...node.style,
      ...(isHovered ? node.hoverStyle : {}),
      transition: node.style?.transition || 'all 0.2s ease-in-out',
    };

    const props: any = {
      key: nodeKey,
      style: mergedStyle,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    };

    if (node.src) props.src = node.src;
    if (node.alt) props.alt = node.alt;
    if (node.href) props.href = node.href;
    if (node.className) props.className = node.className;
    if (node.id) props.id = node.id;

    const children =
      node.children !== undefined ? (
        <PureJsonNode
          node={node.children}
          nodeKey={`${nodeKey}-c`}
          pageSettings={pageSettings}
          isTopLevel={false}
        />
      ) : null;

    return React.createElement(Tag, props, children);
  }

  return null;
};

export function parseAndRenderPureJson(
  jsonInput: string | Record<string, any>,
  overrideDevice?: string
): React.ReactNode[] {
  let parsed: Record<string, any>;
  let pageSettings: any = undefined;

  if (typeof jsonInput === 'string') {
    try {
      parsed = JSON.parse(jsonInput);
    } catch (e) {
      console.error('Failed to parse layout JSON:', e);
      return [
        <div
          key="err"
          style={{ color: '#ff4d4d', padding: '1rem', background: 'rgba(255,0,0,0.1)' }}
        >
          Invalid Layout JSON Payload
        </div>,
      ];
    }
  } else {
    parsed = jsonInput;
  }

  if (!parsed || typeof parsed !== 'object') {
    return [];
  }

  if (parsed.pageBody || parsed.pageSettings) {
    pageSettings = parsed.pageBody || parsed.pageSettings;
  }

  if (overrideDevice) {
    pageSettings = { ...(pageSettings || {}), device: overrideDevice };
  }

  let sectionNodes: any[] = [];
  if (Array.isArray(parsed)) {
    sectionNodes = parsed;
  } else if (Array.isArray(parsed.sections)) {
    sectionNodes = parsed.sections;
  } else if (parsed.layout && Array.isArray(parsed.layout.sections)) {
    sectionNodes = parsed.layout.sections;
  } else if (parsed.layout && typeof parsed.layout === 'object') {
    sectionNodes = Object.values(parsed.layout);
  } else {
    const { pageBody, pageSettings: ps, theme, ...rest } = parsed;
    sectionNodes = Object.values(rest);
  }

  return sectionNodes.map((item, idx) => (
    <PureJsonNode
      key={`sec-${idx}`}
      node={item}
      nodeKey={`sec-${idx}`}
      pageSettings={pageSettings}
      isTopLevel={true}
    />
  ));
}
