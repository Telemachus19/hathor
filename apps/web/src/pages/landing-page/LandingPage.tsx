import React from 'react';
import './styles/theme.css';
import styles from './styles/LandingPage.module.css';
import { Navbar } from './components/Navbar';
import { FeaturedGames } from './components/FeaturedGames';
import { PromoBanner } from './components/PromoBanner';
import { MoreGames } from './components/MoreGames';
import { Footer } from './components/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <Navbar />
      <FeaturedGames />
      <PromoBanner />
      <MoreGames />
      <Footer />
    </div>
  );
};

export default LandingPage;
