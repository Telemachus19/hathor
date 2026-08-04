import React, { useState } from 'react';
import styles from './styles/GameDetailsPage.module.css';
import { GameCarousel } from './components/GameCarousel';
import { GameDetailsHeader } from './components/GameDetailsHeader';
import { GameOwnershipBanner } from './components/GameOwnershipBanner';
import { GameAbout } from './components/GameAbout';
import { GameSystemReqs } from './components/GameSystemReqs';
import { GameReviews } from './components/GameReviews';
import { GameDetailsSidebar } from './components/GameDetailsSidebar';
import { MoreLikeThis } from './components/MoreLikeThis';
import { parseAndRenderPureJson } from '../../utils/pureJsonRenderer';
import { useAuth } from '../../context/AuthContext';

import cyberpunkTheme from './config/themes/cyberpunkTheme.json';
import fantasyTheme from './config/themes/fantasyTheme.json';
import retroTheme from './config/themes/retroTheme.json';
import minimalTheme from './config/themes/minimalTheme.json';
import scifiTheme from './config/themes/scifiTheme.json';

export function getGameDataForSlug(slug?: string) {
  const currentSlug = slug || 'elden-throne';
  const formattedTitle = currentSlug.replace(/-/g, ' ').toUpperCase();

  return {
    title: formattedTitle,
    slug: currentSlug,
    subtitle: `${formattedTitle} EDITION`,
    category: 'GENRE',
    ratingScore: 0,
    reviewCount: '0 Reviews',
    totalReviews: '0 total',
    developer: 'Developer Name',
    publisher: 'Publisher Name',
    releaseDate: 'Coming Soon',
    storage: '0.00 GB',
    priceEgp: '0.00',
    discountPercent: 0,
    platforms: ['WINDOWS'],
    tags: [
      { name: 'TAG 1', slug: 'tag-1' },
      { name: 'TAG 2', slug: 'tag-2' },
    ],
    shortDescription: `Your game description will appear here.`,
    fullDescription: `Your detailed game description will appear here.`,
    bannerUrl: '',
    heroImages: [],
    aboutSections: [
      {
        title: `ABOUT THIS GAME`,
        description: `Describe your game's unique features, mechanics, and world.`,
      },
    ],
    systemReqs: {
      minimum: {
        os: 'Windows 10 (64-bit)',
        cpu: 'Intel Core i5 / AMD Ryzen 5',
        ram: '8 GB',
        gpu: 'NVIDIA GTX 1060 / AMD RX 580',
        storage: '50 GB',
      },
      recommended: {
        os: 'Windows 11 (64-bit)',
        cpu: 'Intel Core i7 / AMD Ryzen 7',
        ram: '16 GB',
        gpu: 'NVIDIA RTX 3070 / AMD RX 6700 XT',
        storage: '50 GB',
      },
    },
    userReviews: [
      {
        id: 'rev-sample',
        userName: 'SAMPLE_USER',
        userAvatarInitials: 'SU',
        ratingScore: 0,
        date: 'No reviews yet',
        comment: 'Player reviews will appear here once the game is published and reviewed.',
        helpfulCount: 0,
        recommended: true,
      },
    ],
    ratingsBreakdown: [
      { stars: 5, percent: 0 },
      { stars: 4, percent: 0 },
      { stars: 3, percent: 0 },
      { stars: 2, percent: 0 },
      { stars: 1, percent: 0 },
    ],
    communityStats: {
      playersCount: '0',
      positiveRatingPct: '0%',
    },
    moreLikeThisGames: [
      {
        title: 'SIMILAR GAME 1',
        slug: 'similar-game-1',
        priceEgp: '0.00',
        discountPercent: 0,
        bannerUrl:
          'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop',
        tags: [{ name: 'Tag', slug: 'tag' }],
      },
      {
        title: 'SIMILAR GAME 2',
        slug: 'similar-game-2',
        priceEgp: '0.00',
        discountPercent: 0,
        bannerUrl:
          'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
        tags: [{ name: 'Tag', slug: 'tag' }],
      },
      {
        title: 'SIMILAR GAME 3',
        slug: 'similar-game-3',
        priceEgp: '0.00',
        discountPercent: 0,
        bannerUrl:
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
        tags: [{ name: 'Tag', slug: 'tag' }],
      },
      {
        title: 'SIMILAR GAME 4',
        slug: 'similar-game-4',
        priceEgp: '0.00',
        discountPercent: 0,
        bannerUrl:
          'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=600&auto=format&fit=crop',
        tags: [{ name: 'Tag', slug: 'tag' }],
      },
    ],
  };
}

export interface GameDetailsPageProps {
  slug?: string;
  device?: 'desktop' | 'tablet' | 'mobile';
  themeConfig?:
    | {
        theme?: 'default' | 'custom';
        layout?: Record<string, any>;
      }
    | Record<string, any>
    | string;
}

type ThemeMode = 'default' | 'cyberpunk' | 'fantasy' | 'retro' | 'minimal' | 'scifi';

/**
 * GameDetailsPage orchestrator located inside src/routes/game-details/.
 */
export const GameDetailsPage: React.FC<GameDetailsPageProps> = ({ slug, themeConfig, device }) => {
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const [activeThemeMode] = useState<ThemeMode>('default');
  const currentGameData = getGameDataForSlug(slug);

  const getThemeInfo = (): {
    theme: string;
    layout: Record<string, any>;
    pageBody?: Record<string, any>;
  } => {
    if (activeThemeMode !== 'default') {
      switch (activeThemeMode) {
        case 'cyberpunk':
          return { theme: 'custom', layout: cyberpunkTheme };
        case 'fantasy':
          return { theme: 'custom', layout: fantasyTheme };
        case 'retro':
          return { theme: 'custom', layout: retroTheme };
        case 'minimal':
          return { theme: 'custom', layout: minimalTheme };
        case 'scifi':
          return { theme: 'custom', layout: scifiTheme };
      }
    }

    if (typeof themeConfig === 'string') {
      try {
        const parsed = JSON.parse(themeConfig);
        return {
          theme: parsed.theme || 'default',
          layout: parsed.layout || {},
          pageBody: parsed.pageBody || parsed.pageSettings || {},
        };
      } catch (e) {
        return { theme: 'default', layout: {}, pageBody: {} };
      }
    }

    if (themeConfig && typeof themeConfig === 'object') {
      return {
        theme: (themeConfig as any).theme || 'default',
        layout: (themeConfig as any).layout || {},
        pageBody: (themeConfig as any).pageBody || (themeConfig as any).pageSettings || {},
      };
    }

    return { theme: 'default', layout: {}, pageBody: {} };
  };

  const themeInfo = getThemeInfo();
  const activeDevice = device || themeInfo.pageBody?.device || 'desktop';
  const isMobileLayout = activeDevice === 'mobile' || activeDevice === 'tablet';

  const isDefaultTheme =
    themeInfo.theme === 'default' ||
    !themeInfo.layout ||
    Object.keys(themeInfo.layout).length === 0;

  const customAboutSections = themeInfo.layout?.gameAbout?.sections;
  const activeAboutSections =
    Array.isArray(customAboutSections) && customAboutSections.length > 0
      ? customAboutSections
      : currentGameData.aboutSections;

  const getThemeBackgroundColor = (): string => {
    if (themeInfo.pageBody?.bg && themeInfo.pageBody.bg !== 'transparent') {
      return themeInfo.pageBody.bg;
    }
    if (!isDefaultTheme) {
      try {
        if (themeInfo.layout.pageCanvas?.style?.background) {
          return themeInfo.layout.pageCanvas.style.background;
        }
        if (themeInfo.layout.pageCanvas?.style?.backgroundColor) {
          return themeInfo.layout.pageCanvas.style.backgroundColor;
        }
      } catch (e) {
        // fallback
      }
    }

    switch (activeThemeMode) {
      case 'cyberpunk':
        return '#0a0c10';
      case 'fantasy':
        return '#121212';
      case 'retro':
        return '#140b24';
      case 'minimal':
        return '#0f172a';
      case 'scifi':
        return 'radial-gradient(ellipse at 20% 0%, #1a0b2e 0%, #0a0414 45%, #050208 100%)';
      default:
        return 'var(--bg-main)';
    }
  };

  const bgImageStyle = themeInfo.pageBody?.bgImage
    ? {
        backgroundImage: `url("${themeInfo.pageBody.bgImage}")`,
        backgroundSize: themeInfo.pageBody.bgSize || 'cover',
        backgroundPosition: themeInfo.pageBody.bgPosition || 'center center',
        backgroundRepeat: themeInfo.pageBody.bgRepeat || 'no-repeat',
        backgroundAttachment: themeInfo.pageBody.bgAttachment || 'fixed',
      }
    : {};

  return (
    <div
      className={styles.page}
      style={{
        background: getThemeBackgroundColor(),
        ...bgImageStyle,
        transition: 'background 0.3s ease',
        minHeight: '100vh',
      }}
    >
      {/* RENDER THEME MODE */}
      {isDefaultTheme ? (
        <>
          <GameCarousel
            images={currentGameData.heroImages}
            device={activeDevice}
            pageSettings={themeInfo.pageBody}
          />
          <div
            className={styles.mainContainer}
            style={{ padding: isMobileLayout ? '1rem 0.75rem 2rem' : undefined }}
          >
            <div
              className={styles.layoutGrid}
              style={{
                gridTemplateColumns: isMobileLayout ? '1fr' : undefined,
                gap: isMobileLayout ? '1.5rem' : '2.5rem',
              }}
            >
              <div className={styles.mainColumn}>
                <GameDetailsHeader
                  title={currentGameData.title}
                  subtitle={currentGameData.subtitle}
                  category={currentGameData.category}
                  ratingScore={currentGameData.ratingScore}
                  reviewCount={currentGameData.reviewCount}
                  developer={currentGameData.developer}
                  releaseDate={currentGameData.releaseDate}
                  tags={currentGameData.tags}
                  description={currentGameData.shortDescription}
                  device={activeDevice}
                  pageSettings={themeInfo.pageBody}
                />
                {isAuthenticated && (
                  <GameOwnershipBanner device={activeDevice} pageSettings={themeInfo.pageBody} />
                )}
                <GameAbout
                  sections={activeAboutSections}
                  device={activeDevice}
                  pageSettings={themeInfo.pageBody}
                />
                <GameSystemReqs
                  minimum={currentGameData.systemReqs.minimum}
                  recommended={currentGameData.systemReqs.recommended}
                  device={activeDevice}
                  pageSettings={themeInfo.pageBody}
                />
                <GameReviews
                  score={currentGameData.ratingScore}
                  totalReviews={currentGameData.totalReviews}
                  reviews={currentGameData.userReviews}
                  device={activeDevice}
                  pageSettings={themeInfo.pageBody}
                />
              </div>
              <div className={styles.sidebarColumn}>
                <GameDetailsSidebar
                  isAuthenticated={isAuthenticated}
                  priceEgp={currentGameData.priceEgp}
                  discountPercent={currentGameData.discountPercent}
                  developer={currentGameData.developer}
                  publisher={currentGameData.publisher}
                  releaseDate={currentGameData.releaseDate}
                  genre={currentGameData.category}
                  platforms={currentGameData.platforms}
                  ratingsBreakdown={currentGameData.ratingsBreakdown}
                  communityStats={currentGameData.communityStats}
                  device={activeDevice}
                />
              </div>
            </div>
            <MoreLikeThis
              games={currentGameData.moreLikeThisGames}
              device={activeDevice}
              pageSettings={themeInfo.pageBody}
            />
          </div>
        </>
      ) : (
        <div
          className={styles.mainContainer}
          style={{
            paddingTop: '2.5rem',
            padding: isMobileLayout ? '1rem 0.75rem 2rem' : undefined,
          }}
        >
          {parseAndRenderPureJson(themeInfo.layout, activeDevice)}
        </div>
      )}
    </div>
  );
};

export default GameDetailsPage;
