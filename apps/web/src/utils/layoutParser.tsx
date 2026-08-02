import React from 'react';
import { GameCarousel } from '../routes/game-details/components/GameCarousel';
import { GameDetailsHeader } from '../routes/game-details/components/GameDetailsHeader';
import { GameOwnershipBanner } from '../routes/game-details/components/GameOwnershipBanner';
import { GameAbout } from '../routes/game-details/components/GameAbout';
import { GameSystemReqs } from '../routes/game-details/components/GameSystemReqs';
import { GameReviews } from '../routes/game-details/components/GameReviews';
import { GameDetailsSidebar } from '../routes/game-details/components/GameDetailsSidebar';
import { MoreLikeThis } from '../routes/game-details/components/MoreLikeThis';

export interface JsonLayoutNode {
  id: string;
  component: string;
  enabled?: boolean;
  props?: Record<string, any>;
}

export interface JsonLayoutStructure {
  hero?: JsonLayoutNode;
  mainColumn: JsonLayoutNode[];
  sidebarColumn: JsonLayoutNode[];
  bottomSection?: JsonLayoutNode[];
}

export interface ReactLayoutNode {
  id: string;
  component: React.ReactNode;
}

export interface ReactLayoutStructure {
  hero?: ReactLayoutNode;
  mainColumn: ReactLayoutNode[];
  sidebarColumn: ReactLayoutNode[];
  bottomSection: ReactLayoutNode[];
}

/**
 * Default JSON String Layout payload used when game theme is empty {}.
 */
export const DEFAULT_LAYOUT_JSON_STRING = JSON.stringify(
  {
    hero: { id: 'hero', component: 'MediaCarousel', enabled: true },
    mainColumn: [
      { id: 'header', component: 'GameDetailsHeader', enabled: true },
      { id: 'ownership_banner', component: 'GameOwnershipBanner', enabled: true },
      { id: 'about', component: 'GameAbout', enabled: true },
      { id: 'system_reqs', component: 'GameSystemReqs', enabled: true },
      { id: 'reviews', component: 'GameReviews', enabled: true },
    ],
    sidebarColumn: [{ id: 'sidebar', component: 'GameDetailsSidebar', enabled: true }],
    bottomSection: [{ id: 'more_like_this', component: 'MoreLikeThis', enabled: true }],
  },
  null,
  2
);

/**
 * Custom JSON String Layout payload for testing alternative section orders & raw components.
 */
export const CUSTOM_LAYOUT_JSON_STRING = JSON.stringify(
  {
    hero: { id: 'hero', component: 'MediaCarousel', enabled: true },
    mainColumn: [
      {
        id: 'custom_banner',
        component: 'CustomAnnouncement',
        props: { title: 'NEON EDITION UNLOCKED', text: 'Exclusive Digital Soundtrack Included.' },
      },
      { id: 'about', component: 'GameAbout', enabled: true },
      { id: 'header', component: 'GameDetailsHeader', enabled: true },
      { id: 'reviews', component: 'GameReviews', enabled: true },
      { id: 'system_reqs', component: 'GameSystemReqs', enabled: true },
    ],
    sidebarColumn: [{ id: 'sidebar', component: 'GameDetailsSidebar', enabled: true }],
    bottomSection: [{ id: 'more_like_this', component: 'MoreLikeThis', enabled: true }],
  },
  null,
  2
);

/**
 * Converts a raw string JSON layout payload into a valid React JSON object containing actual React components.
 */
export function convertJsonToReactLayout(
  jsonInput: string | Record<string, any>,
  gameData: any
): ReactLayoutStructure {
  let parsedJson: JsonLayoutStructure;

  if (typeof jsonInput === 'string') {
    try {
      parsedJson = JSON.parse(jsonInput);
    } catch (e) {
      console.error('Error parsing layout JSON string:', e);
      parsedJson = { mainColumn: [], sidebarColumn: [] };
    }
  } else {
    parsedJson = jsonInput as JsonLayoutStructure;
  }

  const resolveComponent = (node: JsonLayoutNode): React.ReactNode => {
    if (!node || node.enabled === false) return null;

    switch (node.component) {
      case 'GameDetailsHero':
      case 'GameCarousel':
      case 'MediaCarousel':
      case 'media-carousel':
      case 'carousel':
        return <GameCarousel key={node.id} images={gameData.heroImages} />;

      case 'GameDetailsHeader':
        return (
          <GameDetailsHeader
            key={node.id}
            title={gameData.title}
            subtitle={gameData.subtitle}
            category={gameData.category}
            ratingScore={gameData.ratingScore}
            reviewCount={gameData.reviewCount}
            developer={gameData.developer}
            releaseDate={gameData.releaseDate}
            tags={gameData.tags}
            description={gameData.description}
          />
        );

      case 'GameOwnershipBanner':
        return <GameOwnershipBanner key={node.id} />;

      case 'GameAbout':
        return <GameAbout key={node.id} sections={gameData.aboutSections} />;

      case 'GameSystemReqs':
        return (
          <GameSystemReqs
            key={node.id}
            minimum={gameData.systemReqs.minimum}
            recommended={gameData.systemReqs.recommended}
          />
        );

      case 'GameReviews':
        return (
          <GameReviews
            key={node.id}
            score={gameData.ratingScore}
            totalReviews={gameData.totalReviews}
            reviews={gameData.userReviews}
          />
        );

      case 'GameDetailsSidebar':
        return (
          <GameDetailsSidebar
            key={node.id}
            developer={gameData.developer}
            publisher={gameData.publisher}
            releaseDate={gameData.releaseDate}
            genre={gameData.category}
            platforms={gameData.platforms}
            ratingsBreakdown={gameData.ratingsBreakdown}
            communityStats={gameData.communityStats}
          />
        );

      case 'MoreLikeThis':
        return <MoreLikeThis key={node.id} games={gameData.moreLikeThisGames} />;

      default:
        return (
          <div
            key={node.id}
            style={{
              padding: '1.25rem 1.5rem',
              background: '#141a22',
              border: '1px solid #00f0ff',
              color: '#00f0ff',
              borderRadius: '4px',
              marginBottom: '1.5rem',
            }}
          >
            <h4 style={{ margin: '0 0 0.4rem 0', fontFamily: 'Cinzel, sans-serif' }}>
              {node.props?.title || node.component}
            </h4>
            <p style={{ margin: 0, color: '#b0b9c6', fontSize: '0.875rem' }}>
              {node.props?.text || 'Custom component dynamically created from JSON layout.'}
            </p>
          </div>
        );
    }
  };

  return {
    hero: parsedJson.hero
      ? { id: parsedJson.hero.id, component: resolveComponent(parsedJson.hero) }
      : undefined,
    mainColumn: (parsedJson.mainColumn || [])
      .filter((node) => node.enabled !== false)
      .map((node) => ({ id: node.id, component: resolveComponent(node) })),
    sidebarColumn: (parsedJson.sidebarColumn || [])
      .filter((node) => node.enabled !== false)
      .map((node) => ({ id: node.id, component: resolveComponent(node) })),
    bottomSection: (parsedJson.bottomSection || [])
      .filter((node) => node.enabled !== false)
      .map((node) => ({ id: node.id, component: resolveComponent(node) })),
  };
}
