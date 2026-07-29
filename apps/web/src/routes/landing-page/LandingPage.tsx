import React from 'react';
import './styles/theme.css';
import styles from './styles/LandingPage.module.css';
import { FeaturedGames } from './components/FeaturedGames';
import { PromoBanner } from './components/PromoBanner';
import { MoreGames } from './components/MoreGames';

export const LandingPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <FeaturedGames />
      <PromoBanner />
      <MoreGames />
    </div>
  );
};

export default LandingPage;
