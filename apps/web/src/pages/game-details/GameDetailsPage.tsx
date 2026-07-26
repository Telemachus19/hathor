import React, { useState } from 'react';
import styles from './styles/GameDetailsPage.module.css';
import { Navbar } from '../landing-page/components/Navbar';
import { Footer } from '../landing-page/components/Footer';
import {
  convertJsonToReactLayout,
  DEFAULT_LAYOUT_JSON_STRING,
} from './utils/layoutParser';
import { parseAndRenderPureJson } from './utils/pureJsonRenderer';
import cyberpunkTheme from './config/themes/cyberpunkTheme.json';
import fantasyTheme from './config/themes/fantasyTheme.json';
import retroTheme from './config/themes/retroTheme.json';
import minimalTheme from './config/themes/minimalTheme.json';
import scifiTheme from './config/themes/scifiTheme.json';

const mockGameData = {
  title: 'ELDEN THRONE',
  subtitle: 'SHATTERED LANDS EDITION',
  category: 'ACTION RPG',
  ratingScore: 9.4,
  reviewCount: '14.2k Reviews',
  totalReviews: '48.2k total',
  developer: 'Omegabyte Studios',
  publisher: 'Redline Inc',
  releaseDate: 'March 15, 2025',
  storage: '92.00 GB',
  platforms: ['WINDOWS', 'MAC'],
  tags: ['Open World', 'Soulslike', 'Dark Fantasy', 'Single Player', 'RPG', 'Atmospheric'],
  description:
    'A vast open-world action RPG set in the shattered remnants of a dying kingdom. Forge your path through cursed lands, face relentless enemies, and uncover ancient secrets behind the Thrones collapse.',
  heroImages: [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop',
  ],
  aboutSections: [
    {
      title: 'A KINGDOM IN RUIN',
      description:
        'The Shattered Lands stretch across centuries of fallen magic. Once a beacon of wisdom, the Citadel lies in ash, its lords transformed into monstrous guardians. Stripped of purpose, forgotten by time, you awaken in the wreckage of a civilization that no longer remembers your name.',
    },
    {
      title: 'OPEN WORLD, OPEN CONSEQUENCE',
      description:
        'Explore at your own peril. Every cavern, summit, and decaying sanctuary holds hidden pathways and deadly encounters. The world reacts dynamically to your decisions, offering branching alliances and tragic outcomes based on your chosen allegiances.',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
    },
    {
      title: 'COMBAT BUILT ON PATIENCE',
      description:
        'Unforgiving combat demands mastery. Every weapon archetype carries distinct weight, poise dynamics, and stamina costs. Read enemy telegraphs, balance offensive thrusts with defensive rolls, and execute devastating counters against formidable bosses.',
    },
    {
      title: 'A LORE YOU UNCOVER, NOT RECEIVE',
      description:
        'The narrative of Elden Throne is told through item descriptions, environmental architecture, and cryptic dialogue. Uncover hidden lore fragments from defeated bosses to piece together the truth of the Thrones downfall.',
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop',
    },
  ],
  systemReqs: {
    recommended: {
      os: 'Windows 11 (64-bit)',
      cpu: 'Intel Core i7-12700K / AMD Ryzen 7 7800X3D',
      ram: '16 GB RAM',
      gpu: 'NVIDIA GeForce RTX 4070 (12GB) / AMD Radeon RX 7800 XT',
      storage: '85 GB NVMe SSD',
    },
    minimum: {
      os: 'Windows 10 (64-bit)',
      cpu: 'Intel Core i5-8400 / AMD Ryzen 5 2600',
      ram: '12 GB RAM',
      gpu: 'NVIDIA GeForce GTX 1070 (8GB) / AMD Radeon RX 590',
      storage: '85 GB Available Space',
    },
  },
  userReviews: [
    {
      id: 'rev-1',
      userName: 'KHEPRI_VII',
      userAvatarInitials: 'KH',
      ratingScore: 9.6,
      date: 'Jun 15, 2025',
      comment:
        'The open world design is masterful — every horizon hides something worth finding. Combat takes time to click but once it does it\'s deeply rewarding. Boss variety is exceptional.',
      helpfulCount: 54,
      recommended: true,
    },
    {
      id: 'rev-2',
      userName: 'Shadow_Vex',
      userAvatarInitials: 'SV',
      ratingScore: 9.2,
      date: 'May 28, 2025',
      comment:
        'The level design in the Citadel of Ash is absolute peak gaming. Visually stunning, incredibly challenging boss mechanics, and unmatched soundtrack atmosphere.',
      helpfulCount: 38,
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
      priceEgp: '329.99',
      discountPercent: 15,
      bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
      tags: [{ name: 'Soulslike', slug: 'soulslike' }],
    },
    {
      title: 'MOON REQUIEM',
      slug: 'moon-requiem',
      priceEgp: '189.99',
      discountPercent: 30,
      bannerUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=600&auto=format&fit=crop',
      tags: [{ name: 'Indie', slug: 'indie' }, { name: 'RPG', slug: 'rpg' }],
    },
  ],
};

export interface GameDetailsPageProps {
  themeConfig?: Record<string, any> | string;
}

type ThemeMode = 'default' | 'cyberpunk' | 'fantasy' | 'retro' | 'minimal' | 'scifi';

/**
 * GameDetailsPage orchestrator supporting 5 distinct raw JSON theme designs rendered
 * dynamically with interactive carousels, hover effects, and theme-specific background colors.
 */
export const GameDetailsPage: React.FC<GameDetailsPageProps> = ({
  themeConfig,
}) => {
  const [activeThemeMode, setActiveThemeMode] = useState<ThemeMode>('default');

  const getCustomThemeJson = (): string => {
    switch (activeThemeMode) {
      case 'cyberpunk':
        return JSON.stringify(cyberpunkTheme);
      case 'fantasy':
        return JSON.stringify(fantasyTheme);
      case 'retro':
        return JSON.stringify(retroTheme);
      case 'minimal':
        return JSON.stringify(minimalTheme);
      case 'scifi':
        return JSON.stringify(scifiTheme);
      default:
        return typeof themeConfig === 'string'
          ? themeConfig
          : JSON.stringify(themeConfig || {});
    }
  };

  const getThemeBackgroundColor = (): string => {
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
        return '#030712';
      default:
        return 'var(--bg-main)';
    }
  };

  const isDefaultTheme =
    activeThemeMode === 'default' &&
    (!themeConfig || (typeof themeConfig === 'object' && Object.keys(themeConfig).length === 0));

  return (
    <div className={styles.page} style={{ backgroundColor: getThemeBackgroundColor(), transition: 'background-color 0.3s ease' }}>
      <Navbar />

      {/* Floating Theme Switcher bar for live testing 5 distinct raw JSON theme designs */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          background: '#0e1116',
          border: '1px solid #f26b21',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          display: 'flex',
          gap: '0.4rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          maxWidth: '650px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
        }}
      >
        <span style={{ fontSize: '0.7rem', color: '#e6ddcb', fontWeight: 900, marginRight: '0.2rem' }}>
          THEMES:
        </span>
        <button
          onClick={() => setActiveThemeMode('default')}
          style={{
            background: activeThemeMode === 'default' ? '#f26b21' : 'transparent',
            color: activeThemeMode === 'default' ? '#000000' : '#ffffff',
            border: '1px solid #f26b21',
            padding: '0.3rem 0.6rem',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '0.6875rem',
            fontWeight: 800,
          }}
        >
          DEFAULT ({'{}'})
        </button>
        <button
          onClick={() => setActiveThemeMode('cyberpunk')}
          style={{
            background: activeThemeMode === 'cyberpunk' ? '#00f0ff' : 'transparent',
            color: activeThemeMode === 'cyberpunk' ? '#000000' : '#ffffff',
            border: '1px solid #00f0ff',
            padding: '0.3rem 0.6rem',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '0.6875rem',
            fontWeight: 800,
          }}
        >
          1. CYBERPUNK
        </button>
        <button
          onClick={() => setActiveThemeMode('fantasy')}
          style={{
            background: activeThemeMode === 'fantasy' ? '#d4af37' : 'transparent',
            color: activeThemeMode === 'fantasy' ? '#000000' : '#ffffff',
            border: '1px solid #d4af37',
            padding: '0.3rem 0.6rem',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '0.6875rem',
            fontWeight: 800,
          }}
        >
          2. FANTASY
        </button>
        <button
          onClick={() => setActiveThemeMode('retro')}
          style={{
            background: activeThemeMode === 'retro' ? '#bd00ff' : 'transparent',
            color: activeThemeMode === 'retro' ? '#ffffff' : '#ffffff',
            border: '1px solid #bd00ff',
            padding: '0.3rem 0.6rem',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '0.6875rem',
            fontWeight: 800,
          }}
        >
          3. RETRO
        </button>
        <button
          onClick={() => setActiveThemeMode('minimal')}
          style={{
            background: activeThemeMode === 'minimal' ? '#38bdf8' : 'transparent',
            color: activeThemeMode === 'minimal' ? '#000000' : '#ffffff',
            border: '1px solid #38bdf8',
            padding: '0.3rem 0.6rem',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '0.6875rem',
            fontWeight: 800,
          }}
        >
          4. MINIMAL
        </button>
        <button
          onClick={() => setActiveThemeMode('scifi')}
          style={{
            background: activeThemeMode === 'scifi' ? '#10b981' : 'transparent',
            color: activeThemeMode === 'scifi' ? '#000000' : '#ffffff',
            border: '1px solid #10b981',
            padding: '0.3rem 0.6rem',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '0.6875rem',
            fontWeight: 800,
          }}
        >
          5. SCI-FI VOID
        </button>
      </div>

      {isDefaultTheme ? (
        /* MODE A: Default Layout */
        (() => {
          const reactLayout = convertJsonToReactLayout(DEFAULT_LAYOUT_JSON_STRING, mockGameData);
          return (
            <>
              {reactLayout.hero?.component}
              <div className={styles.mainContainer}>
                <div className={styles.layoutGrid}>
                  <div className={styles.mainColumn}>
                    {reactLayout.mainColumn.map((item) => (
                      <React.Fragment key={item.id}>{item.component}</React.Fragment>
                    ))}
                  </div>
                  <div className={styles.sidebarColumn}>
                    {reactLayout.sidebarColumn.map((item) => (
                      <React.Fragment key={item.id}>{item.component}</React.Fragment>
                    ))}
                  </div>
                </div>
                {reactLayout.bottomSection.map((item) => (
                  <React.Fragment key={item.id}>{item.component}</React.Fragment>
                ))}
              </div>
            </>
          );
        })()
      ) : (
        /* MODE B: Pure Raw JSON Layout Engine - Zero Local Files or Segment Assumptions */
        <div className={styles.mainContainer} style={{ paddingTop: '2.5rem' }}>
          {parseAndRenderPureJson(getCustomThemeJson())}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default GameDetailsPage;
