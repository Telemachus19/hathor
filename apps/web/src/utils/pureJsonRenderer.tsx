import React, { useState } from 'react';
import {
  GameDetailsHeader,
  GameOwnershipBanner,
  GameDetailsHero,
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
  GameHero: 'game-hero', 'game-hero': 'game-hero',
  GameHeader: 'game-header', 'game-header': 'game-header',
  OwnershipBanner: 'ownership-banner', 'ownership-banner': 'ownership-banner',
  AboutGame: 'about-game', 'about-game': 'about-game',
  SystemReqs: 'system-reqs', 'system-reqs': 'system-reqs',
  UserReviews: 'user-reviews', 'user-reviews': 'user-reviews',
  SidebarCTA: 'sidebar-cta', 'sidebar-cta': 'sidebar-cta',
  SidebarInfo: 'sidebar-info', 'sidebar-info': 'sidebar-info',
  SidebarRatings: 'sidebar-ratings', 'sidebar-ratings': 'sidebar-ratings',
  SidebarCommunity: 'sidebar-community', 'sidebar-community': 'sidebar-community',
  Recommendations: 'recommendations', 'recommendations': 'recommendations',
  CustomGrid: 'grid', GridSection: 'grid', 'grid': 'grid',
  CarouselShowcase: 'carousel', Carousel: 'carousel', 'carousel': 'carousel',
  FeaturesGrid: 'features', 'features': 'features',
  TwoColumns: 'two-col', 'two-col': 'two-col',
  CTABlock: 'cta', CTA: 'cta', 'cta': 'cta',
  HeadingBlock: 'heading', Heading: 'heading', 'heading': 'heading',
  TextBlock: 'text', Text: 'text', 'text': 'text',
  ImageBlock: 'image', Image: 'image', 'image': 'image',
  ButtonBlock: 'button', Button: 'button', 'button': 'button',
  Divider: 'divider', 'divider': 'divider',
  Spacer: 'spacer', 'spacer': 'spacer'
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

function ComponentSectionWrapper({ s, children }: { s: any; children: React.ReactNode }) {
  const pt = s.pt ?? 0;
  const pb = s.pb ?? 0;
  const leftPad = s.pl ?? s.ph ?? 0;
  const rightPad = s.pr ?? s.ph ?? 0;
  const mb = s.mb ?? 32;

  return (
    <div
      style={{
        backgroundColor: s.bg || 'transparent',
        backgroundImage: s.bgImage ? `url("${s.bgImage}")` : undefined,
        backgroundSize: s.bgSize || 'cover',
        backgroundPosition: s.bgPosition || 'center center',
        backgroundRepeat: s.bgRepeat || 'no-repeat',
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
      {children}
    </div>
  );
}

function ComponentNodeContent({ s, nodeKey }: { s: any; nodeKey: string | number }) {
  const type = s.type;

  if (type === 'game-hero') return <GameDetailsHero key={nodeKey} s={s} />;
  if (type === 'game-header') return <GameDetailsHeader key={nodeKey} s={s} />;
  if (type === 'ownership-banner') return <GameOwnershipBanner key={nodeKey} s={s} />;
  if (type === 'about-game') return <GameAbout key={nodeKey} s={s} />;
  if (type === 'system-reqs') return <GameSystemReqs key={nodeKey} s={s} />;
  if (type === 'user-reviews') return <GameReviews key={nodeKey} s={s} />;
  if (type === 'sidebar-cta') return <GameSidebarCta key={nodeKey} s={s} />;
  if (type === 'sidebar-info') return <GameSidebarInfo key={nodeKey} s={s} />;
  if (type === 'sidebar-ratings') return <GameSidebarRatings key={nodeKey} s={s} />;
  if (type === 'sidebar-community') return <GameSidebarCommunity key={nodeKey} s={s} />;
  if (type === 'recommendations') return <MoreLikeThis key={nodeKey} s={s} />;
  if (type === 'carousel') return <GameCarousel key={nodeKey} s={s} />;
  if (type === 'features') return <GameFeatures key={nodeKey} s={s} />;
  if (type === 'two-col') return <GameTwoCol key={nodeKey} s={s} />;
  if (type === 'cta') return <GameCtaBlock key={nodeKey} s={s} />;
  if (type === 'heading') return <HeadingRenderer key={nodeKey} s={s} />;
  if (type === 'text') return <TextRenderer key={nodeKey} s={s} />;
  if (type === 'image') return <ImageRenderer key={nodeKey} s={s} />;
  if (type === 'button') return <ButtonRenderer key={nodeKey} s={s} />;
  if (type === 'divider') return <DividerRenderer key={nodeKey} s={s} />;
  if (type === 'spacer') return <SpacerRenderer key={nodeKey} s={s} />;

  if (type === 'grid' || s.gridCols) {
    const gridCols = s.gridCols || [];
    const templateStr = s.gridTemplate || '1:1';
    const gridGap = s.gridGap || 24;

    const colCount = gridCols.length || 2;
    let templateCss = `repeat(${colCount}, 1fr)`;
    if (templateStr === '2:1') templateCss = '2fr 1fr';
    if (templateStr === '1:2') templateCss = '1fr 2fr';
    if (templateStr === '1:2:1') templateCss = '1fr 2fr 1fr';

    return (
      <div key={nodeKey} style={{ display: 'grid', gridTemplateColumns: templateCss, gap: gridGap, width: '100%', boxSizing: 'border-box' }}>
        {gridCols.map((col: any, cIdx: number) => {
          const colStyle = col.style?.column || {};
          const colBg = colStyle.background || col.bg || 'transparent';
          const colElements = col.children ? Object.values(col.children) : col.elements || [];

          return (
            <div key={col.id || cIdx} style={{ background: colBg, borderRadius: 4, padding: col.ph || 0, boxSizing: 'border-box', width: '100%' }}>
              {Array.isArray(colElements) ? colElements.map((el: any, eIdx: number) => (
                <ComponentNodeRenderer key={el.id || eIdx} node={el} nodeKey={`${nodeKey}-col${cIdx}-el${eIdx}`} />
              )) : Object.entries(colElements).map(([elKey, elVal]) => (
                <ComponentNodeRenderer key={elKey} node={elVal} nodeKey={elKey} />
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  return <div key={nodeKey} />;
}

function ComponentNodeRenderer({ node, nodeKey }: { node: any; nodeKey: string | number }) {
  const s = normalizeNode(node);
  return (
    <ComponentSectionWrapper s={s}>
      <ComponentNodeContent s={s} nodeKey={nodeKey} />
    </ComponentSectionWrapper>
  );
}

/**
 * Pure JSON-to-React Node Renderer with ZERO assumptions & ZERO infinite recursion.
 */
export const PureJsonNode: React.FC<{ node: any; nodeKey: string | number }> = ({
  node,
  nodeKey,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (node === null || node === undefined) return null;

  if (typeof node === 'string' || typeof node === 'number') {
    return <>{node}</>;
  }

  if (Array.isArray(node)) {
    return (
      <>
        {node.map((child, idx) => (
          <PureJsonNode key={`${nodeKey}-${idx}`} node={child} nodeKey={`${nodeKey}-${idx}`} />
        ))}
      </>
    );
  }

  if (typeof node === 'object') {
    if (node.component || node.type) {
      return <ComponentNodeRenderer node={node} nodeKey={nodeKey} />;
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
        <PureJsonNode node={node.children} nodeKey={`${nodeKey}-c`} />
      ) : null;

    return React.createElement(Tag, props, children);
  }

  return null;
};

/**
 * Parses raw string JSON or object JSON and converts it directly to React elements with 100% 1:1 component mapping.
 */
export function parseAndRenderPureJson(jsonInput: string | Record<string, any>): React.ReactNode[] {
  let parsed: Record<string, any>;

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

  if (parsed.layout && typeof parsed.layout === 'object') {
    parsed = parsed.layout;
  }

  if (Array.isArray(parsed)) {
    return parsed.map((item, idx) => (
      <PureJsonNode key={`node-${idx}`} node={item} nodeKey={`node-${idx}`} />
    ));
  }

  return Object.entries(parsed).map(([key, val]) => (
    <PureJsonNode key={key} node={val} nodeKey={key} />
  ));
}
