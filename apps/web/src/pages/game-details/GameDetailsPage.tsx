import React from 'react';
import styles from './styles/GameDetailsPage.module.css';
import { Navbar } from '../landing-page/components/Navbar';
import { Footer } from '../landing-page/components/Footer';
import { GameDetailsHero } from './components/GameDetailsHero';
import { GameDetailsHeader } from './components/GameDetailsHeader';
import { GameOwnershipBanner } from './components/GameOwnershipBanner';
import { GameAbout } from './components/GameAbout';
import { GameSystemReqs } from './components/GameSystemReqs';
import { GameReviews } from './components/GameReviews';
import { GameDetailsSidebar } from './components/GameDetailsSidebar';
import { MoreLikeThis } from './components/MoreLikeThis';

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
    avgCompletionTime: '32 hrs',
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

export const GameDetailsPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <Navbar />

      <GameDetailsHero images={mockGameData.heroImages} />

      <div className={styles.mainContainer}>
        <div className={styles.layoutGrid}>
          <div className={styles.mainColumn}>
            <GameDetailsHeader
              title={mockGameData.title}
              subtitle={mockGameData.subtitle}
              category={mockGameData.category}
              ratingScore={mockGameData.ratingScore}
              reviewCount={mockGameData.reviewCount}
              developer={mockGameData.developer}
              releaseDate={mockGameData.releaseDate}
              tags={mockGameData.tags}
              description={mockGameData.description}
            />

            <GameOwnershipBanner />

            <GameAbout sections={mockGameData.aboutSections} />

            <GameSystemReqs
              minimum={mockGameData.systemReqs.minimum}
              recommended={mockGameData.systemReqs.recommended}
            />

            <GameReviews
              score={mockGameData.ratingScore}
              totalReviews={mockGameData.totalReviews}
              reviews={mockGameData.userReviews}
            />
          </div>

          <div className={styles.sidebarColumn}>
            <GameDetailsSidebar
              developer={mockGameData.developer}
              publisher={mockGameData.publisher}
              releaseDate={mockGameData.releaseDate}
              genre="Action RPG"
              platforms={mockGameData.platforms}
              ratingsBreakdown={mockGameData.ratingsBreakdown}
              communityStats={mockGameData.communityStats}
            />
          </div>
        </div>

        <MoreLikeThis games={mockGameData.moreLikeThisGames} />
      </div>

      <Footer />
    </div>
  );
};

export default GameDetailsPage;
