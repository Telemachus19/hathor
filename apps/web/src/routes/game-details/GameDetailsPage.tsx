import React, { useState } from 'react';
import styles from './styles/GameDetailsPage.module.css';
import { GameDetailsHero } from './components/GameDetailsHero';
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
    category: 'ACTION RPG',
    ratingScore: 9.4,
    reviewCount: '14.2k Reviews',
    totalReviews: '48.2k total',
    developer: 'Omegabyte Studios',
    publisher: 'Redline Inc',
    releaseDate: 'March 15, 2025',
    storage: '92.00 GB',
    priceEgp: '299.99',
    discountPercent: 10,
    platforms: ['WINDOWS', 'MAC'],
    tags: [
      { name: 'OPEN WORLD', slug: 'open-world' },
      { name: 'SOULSLIKE', slug: 'soulslike' },
      { name: 'DARK FANTASY', slug: 'dark-fantasy' },
      { name: 'SINGLE PLAYER', slug: 'single-player' },
      { name: 'RPG', slug: 'rpg' },
      { name: 'ATMOSPHERIC', slug: 'atmospheric' },
    ],
    shortDescription: `A vast open-world experience set in ${formattedTitle}. Forge your path, face relentless enemies, and uncover ancient secrets behind the kingdom's collapse.`,
    fullDescription: `The world of ${formattedTitle} stretches across centuries of fallen magic. Explore decaying sanctuaries and face legendary boss guardians in unforgiving, patient combat.`,
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    heroImages: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop',
    ],
    aboutSections: [
      {
        title: `ABOUT THIS GAME`,
        description: `Explore the world of ${formattedTitle}. Uncover ancient mysteries, master combat dynamics, and forge your journey.`,
      },
    ],
    systemReqs: {
      minimum: {
        os: 'Windows 10 (64-bit)',
        cpu: 'Intel Core i5-8400 / AMD Ryzen 5 2600',
        ram: '12 GB RAM',
        gpu: 'NVIDIA GeForce GTX 1070 (8GB) / AMD Radeon RX 590',
        storage: '85 GB Available Space',
      },
      recommended: {
        os: 'Windows 11 (64-bit)',
        cpu: 'Intel Core i7-12700K / AMD Ryzen 7 7800X3D',
        ram: '16 GB RAM',
        gpu: 'NVIDIA GeForce RTX 4070 (12GB) / AMD Radeon RX 7800 XT',
        storage: '85 GB NVMe SSD',
      },
    },
    userReviews: [
      {
        id: 'rev-1',
        userName: 'KHEPRI_VII',
        userAvatarInitials: 'KH',
        ratingScore: 9.6,
        date: 'Jun 15, 2025',
        comment: `Masterpiece! ${formattedTitle} exceeded all my expectations with its world design and combat polish.`,
        helpfulCount: 54,
        recommended: true,
      },
    ],
    ratingsBreakdown: [
      { stars: 5, percent: 82 },
      { stars: 4, percent: 12 },
      { stars: 3, percent: 4 },
      { stars: 2, percent: 1 },
      { stars: 1, percent: 1 },
    ],
    communityStats: {
      playersCount: '250,000+',
      positiveRatingPct: '94%',
    },
    moreLikeThisGames: [
      {
        title: 'SHATTERED REALM',
        slug: 'shattered-realm',
        priceEgp: '349.00',
        discountPercent: 20,
        bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop',
        tags: [{ name: 'Action', slug: 'action' }, { name: 'RPG', slug: 'rpg' }],
      },
      {
        title: 'CRIMSON ACCORD',
        slug: 'crimson-accord',
        priceEgp: '524.99',
        discountPercent: 0,
        bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
        tags: [{ name: 'Dark Fantasy', slug: 'dark-fantasy' }],
      },
      {
        title: 'ASHEN TALE',
        slug: 'ashen-tale',
        priceEgp: '529.99',
        discountPercent: 0,
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
        tags: [{ name: 'Adventure', slug: 'adventure' }],
      },
      {
        title: 'MOON REQUIEM',
        slug: 'moon-requiem',
        priceEgp: '169.99',
        discountPercent: 50,
        bannerUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=600&auto=format&fit=crop',
        tags: [{ name: 'Gothic', slug: 'gothic' }],
      },
    ],
  };
}

export interface GameDetailsPageProps {
  slug?: string;
  themeConfig?: {
    theme?: 'default' | 'custom';
    layout?: Record<string, any>;
  } | Record<string, any> | string;
}

type ThemeMode = 'default' | 'cyberpunk' | 'fantasy' | 'retro' | 'minimal' | 'scifi';

/**
 * GameDetailsPage orchestrator located inside src/routes/game-details/.
 */
export const GameDetailsPage: React.FC<GameDetailsPageProps> = ({
  slug,
  themeConfig,
}) => {
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const [activeThemeMode] = useState<ThemeMode>('default');
  const currentGameData = getGameDataForSlug(slug);

  const getThemeInfo = (): { theme: string; layout: Record<string, any> } => {
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
        };
      } catch (e) {
        return { theme: 'default', layout: {} };
      }
    }

    if (themeConfig && typeof themeConfig === 'object') {
      return {
        theme: (themeConfig as any).theme || 'default',
        layout: (themeConfig as any).layout || {},
      };
    }

    return { theme: 'default', layout: {} };
  };

  const themeInfo = getThemeInfo();
  const isDefaultTheme =
    themeInfo.theme === 'default' ||
    !themeInfo.layout ||
    Object.keys(themeInfo.layout).length === 0 ||
    'gameAbout' in themeInfo.layout;

  const customAboutSections = themeInfo.layout?.gameAbout?.sections;
  const activeAboutSections =
    Array.isArray(customAboutSections) && customAboutSections.length > 0
      ? customAboutSections
      : currentGameData.aboutSections;

  const getThemeBackgroundColor = (): string => {
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

  return (
    <div
      className={styles.page}
      style={{
        background: getThemeBackgroundColor(),
        transition: 'background 0.3s ease',
        minHeight: '100vh',
      }}
    >
      {/* RENDER THEME MODE */}
      {isDefaultTheme ? (
        <>
          <GameDetailsHero images={currentGameData.heroImages} />
          <div className={styles.mainContainer}>
            <div className={styles.layoutGrid}>
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
                />
                {isAuthenticated && <GameOwnershipBanner />}
                <GameAbout sections={activeAboutSections} />
                <GameSystemReqs
                  minimum={currentGameData.systemReqs.minimum}
                  recommended={currentGameData.systemReqs.recommended}
                />
                <GameReviews
                  score={currentGameData.ratingScore}
                  totalReviews={currentGameData.totalReviews}
                  reviews={currentGameData.userReviews}
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
                />
              </div>
            </div>
            <MoreLikeThis games={currentGameData.moreLikeThisGames} />
          </div>
        </>
      ) : (
        <div className={styles.mainContainer} style={{ paddingTop: '2.5rem' }}>
          {parseAndRenderPureJson(themeInfo.layout)}
        </div>
      )}
    </div>
  );
};

export default GameDetailsPage;
