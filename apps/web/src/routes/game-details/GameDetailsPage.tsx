import React from 'react';
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
import { useGameOwnership, type CatalogGameItem } from '../../services/api';

export function getGameDataForSlug(slug?: string) {
  const currentSlug = slug || 'elden-throne';
  const formattedTitle = currentSlug.replace(/-/g, ' ').toUpperCase();

  return {
    title: formattedTitle,
    slug: currentSlug,
    subtitle: '',
    category: 'Action',
    ratingScore: 4.8,
    reviewCount: '128 Reviews',
    totalReviews: '128 total',
    developer: 'Hathor Studios',
    publisher: 'Hathor Publishing',
    releaseDate: 'Aug 2026',
    storage: '50 GB',
    priceEgp: '299.99',
    discountPercent: 0,
    platforms: ['Windows'],
    tags: [
      { id: '1', name: 'Action', slug: 'action' },
      { id: '2', name: 'Adventure', slug: 'adventure' },
      { id: '3', name: 'RPG', slug: 'rpg' },
    ],
    bannerUrl:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600&auto=format&fit=crop',
    heroImages: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600&auto=format&fit=crop',
    ],
    shortDescription:
      'Experience an unforgettable journey through stunning visuals, deep gameplay mechanics, and rich storytelling.',
    fullDescription:
      'Detailed information regarding the game narrative, combat systems, exploration mechanics, and post-launch updates will be shown here.',
    aboutSections: [
      {
        title: 'ABOUT THIS GAME',
        description:
          'Experience an unforgettable journey through stunning visuals, deep gameplay mechanics, and rich storytelling.',
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
        id: 'rev-1',
        author: 'CYBER_RUNNER',
        rating: 5,
        date: 'Recent',
        content:
          'Absolute masterpiece. The visuals and atmosphere set a new benchmark in gaming excellence.',
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop',
        likes: 124,
      },
      {
        id: 'rev-2',
        author: 'PIXEL_WARRIOR',
        rating: 4,
        date: 'Last Month',
        content:
          'Stunning design and combat mechanics. Highly recommended for fans of the genre.',
        avatar:
          'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=120&auto=format&fit=crop',
        likes: 89,
      },
    ],
    ratingsBreakdown: [
      { stars: 5, percent: 78 },
      { stars: 4, percent: 14 },
      { stars: 3, percent: 5 },
      { stars: 2, percent: 2 },
      { stars: 1, percent: 1 },
    ],
    communityStats: {
      playersCount: '14,892',
      positiveRatingPct: '94%',
    },
    moreLikeThisGames: [
      {
        id: 'rec-1',
        title: 'Neon Overdrive',
        genre: 'Action RPG',
        rating: 4.8,
        priceEgp: '299.99',
        discountPercent: 10,
        slug: 'neon-overdrive',
        imageUrl:
          'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
      },
      {
        id: 'rec-2',
        title: 'Pharaoh Tactics',
        genre: 'Strategy',
        rating: 4.7,
        priceEgp: '449.50',
        slug: 'pharaoh-tactics',
        imageUrl:
          'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
      },
      {
        id: 'rec-3',
        title: 'Shadow Realm',
        genre: 'Dark Fantasy',
        rating: 4.9,
        priceEgp: '349.00',
        discountPercent: 20,
        slug: 'shadow-realm',
        imageUrl:
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
      },
    ],
  };
}

export interface GameDetailsPageProps {
  slug?: string;
  gameId?: string;
  gameData?: CatalogGameItem | null;
  device?: 'desktop' | 'tablet' | 'mobile';
  isDesignerPreview?: boolean;
  themeConfig?:
    | {
        theme?: 'default' | 'custom';
        layout?: Record<string, any>;
      }
    | Record<string, any>
    | string;
}

/**
 * GameDetailsPage orchestrator located inside src/routes/game-details/.
 */
export const GameDetailsPage: React.FC<GameDetailsPageProps> = ({
  slug,
  gameId,
  gameData,
  themeConfig,
  device,
  isDesignerPreview,
}) => {
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const effectiveGameId = gameId || (gameData as any)?.id;
  const {
    data: isOwned,
    isLoading: isOwnershipLoading,
    isFetching: isOwnershipFetching,
    isError: isOwnershipError,
  } = useGameOwnership(effectiveGameId);
  const isOwnershipCheckPending =
    isAuthenticated &&
    Boolean(effectiveGameId) &&
    (isOwnershipLoading || (isOwnershipFetching && isOwned === undefined));
  const isOwnershipCheckError =
    isAuthenticated && Boolean(effectiveGameId) && Boolean(isOwnershipError);
  const baseData = getGameDataForSlug(slug);

  const formattedReleaseDate =
    gameData?.updatedAt || gameData?.createdAt
      ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
          new Date(gameData.updatedAt || gameData.createdAt!)
        )
      : baseData.releaseDate;

  const gameCategory =
    gameData?.genre?.name ||
    (gameData as any)?.category ||
    (gameData?.tags && gameData.tags.length > 0 ? gameData.tags[0].name : baseData.category);

  let gamePlatforms = ['Windows'];
  if (gameData?.systemRequirements) {
    const reqs = gameData.systemRequirements as Record<string, any>;
    const detected = Object.keys(reqs)
      .filter((k) => !['minimum', 'recommended'].includes(k.toLowerCase()))
      .map((k) => k.charAt(0).toUpperCase() + k.slice(1).toLowerCase());
    if (detected.length > 0) {
      gamePlatforms = detected;
    }
  }
  if (Array.isArray((gameData as any)?.platforms) && (gameData as any).platforms.length > 0) {
    gamePlatforms = (gameData as any).platforms;
  }

  const gameDeveloper =
    (gameData as any)?.developer ||
    (gameData as any)?.creatorName ||
    baseData.developer;

  const gamePublisher =
    (gameData as any)?.publisher ||
    gameDeveloper ||
    baseData.publisher;

  const currentGameData = {
    ...baseData,
    subtitle: (gameData as any)?.subtitle || '',
    category: gameCategory,
    developer: gameDeveloper,
    publisher: gamePublisher,
    releaseDate: formattedReleaseDate,
    platforms: gamePlatforms,
    ...(gameData
      ? {
          title: gameData.title || baseData.title,
          priceEgp: gameData.priceEgp || baseData.priceEgp,
          discountPercent:
            gameData.discountPercent !== undefined
              ? gameData.discountPercent
              : baseData.discountPercent,
          shortDescription: gameData.shortDescription || baseData.shortDescription,
          fullDescription: gameData.fullDescription || baseData.fullDescription,
          bannerUrl: gameData.bannerUrl || baseData.bannerUrl,
          tags: gameData.tags?.length ? gameData.tags : baseData.tags,
          heroImages: gameData.bannerUrl
            ? [gameData.bannerUrl, ...baseData.heroImages.filter((img: string) => img !== gameData.bannerUrl)]
            : baseData.heroImages,
        }
      : {}),
  };

  const getThemeInfo = (): {
    theme: string;
    sections?: any[];
    layout: Record<string, any>;
    pageBody?: Record<string, any>;
    pageSettings?: Record<string, any>;
    fullPayload: any;
  } => {
    if (typeof themeConfig === 'string') {
      try {
        const parsed = JSON.parse(themeConfig);
        return {
          theme: parsed.theme || (parsed.sections?.length ? 'custom' : 'default'),
          sections: parsed.sections,
          layout: parsed.layout || parsed,
          pageBody: parsed.pageBody || parsed.pageSettings || {},
          pageSettings: parsed.pageSettings || parsed.pageBody || {},
          fullPayload: parsed,
        };
      } catch (e) {
        return { theme: 'default', layout: {}, pageBody: {}, pageSettings: {}, fullPayload: {} };
      }
    }

    if (themeConfig && typeof themeConfig === 'object') {
      const parsed = themeConfig as any;
      return {
        theme: parsed.theme || (parsed.sections?.length ? 'custom' : 'default'),
        sections: parsed.sections,
        layout: parsed.layout || parsed,
        pageBody: parsed.pageBody || parsed.pageSettings || {},
        pageSettings: parsed.pageSettings || parsed.pageBody || {},
        fullPayload: parsed,
      };
    }

    return { theme: 'default', layout: {}, pageBody: {}, pageSettings: {}, fullPayload: {} };
  };

  const themeInfo = getThemeInfo();
  const activeDevice = device || themeInfo.pageBody?.device || 'desktop';
  const isMobileLayout = activeDevice === 'mobile' || activeDevice === 'tablet';

  const isDefaultTheme =
    themeInfo.theme !== 'custom' ||
    !themeInfo.sections ||
    themeInfo.sections.length === 0;

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

    return 'var(--bg-main)';
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
        <div
          className={styles.mainContainer}
          style={{ padding: isMobileLayout ? '1rem 0.75rem 2rem' : undefined }}
        >
          <div className={styles.carouselWrapper}>
            <GameCarousel
              images={currentGameData.heroImages}
              device={activeDevice}
              pageSettings={themeInfo.pageBody}
            />
          </div>
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
              {isAuthenticated && Boolean(isOwned) && (
                <GameOwnershipBanner
                  device={activeDevice}
                  pageSettings={themeInfo.pageBody}
                  isOwned={Boolean(isOwned)}
                />
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
                gameId={effectiveGameId}
                isDesignerPreview={isDesignerPreview}
                isAuthenticated={isAuthenticated}
                isOwned={Boolean(isOwned)}
                isOwnershipCheckPending={Boolean(isOwnershipCheckPending)}
                isOwnershipCheckError={Boolean(isOwnershipCheckError)}
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
          <div className={styles.moreLikeThisWrapper}>
            <MoreLikeThis
              games={currentGameData.moreLikeThisGames}
              device={activeDevice}
              pageSettings={themeInfo.pageBody}
            />
          </div>
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            maxWidth:
              activeDevice === 'mobile'
                ? 375
                : activeDevice === 'tablet'
                  ? 768
                  : themeInfo.pageSettings?.containerWidth || 1280,
            margin: '0 auto',
            paddingTop: themeInfo.pageSettings?.padTop ?? 0,
            paddingBottom: themeInfo.pageSettings?.padBottom ?? 48,
            paddingLeft: themeInfo.pageSettings?.padLeft ?? (isMobileLayout ? 12 : 0),
            paddingRight: themeInfo.pageSettings?.padRight ?? (isMobileLayout ? 12 : 0),
            boxSizing: 'border-box',
          }}
        >
          {parseAndRenderPureJson(themeInfo.fullPayload, activeDevice, {
            gameId: effectiveGameId,
            gameData: currentGameData,
            isDesignerPreview,
            isAuthenticated,
            isOwned: Boolean(isOwned),
            isOwnershipCheckPending: Boolean(isOwnershipCheckPending),
            isOwnershipCheckError: Boolean(isOwnershipCheckError),
          })}
        </div>
      )}
    </div>
  );
};

export default GameDetailsPage;
