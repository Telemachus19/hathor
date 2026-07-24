import React, { useState } from 'react';
import styles from '../styles/MoreGames.module.css';
import { GameCard } from './GameCard';
import { EyeOfHorusIcon } from '../assets';

const categories = ['ALL', 'RPG', 'ACTION', 'INDIE', 'MULTIPLAYER', 'STRATEGY'];

const allGames = [
  {
    title: 'Neon Horizon',
    category: 'RPG',
    rating: 4.7,
    price: 19.99,
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80',
    tag: 'STORY RICH',
  },
  {
    title: 'Dark Citadel',
    category: 'CPRG',
    rating: 5.0,
    price: 59.99,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    tag: 'GOTY 2023',
  },
  {
    title: 'Cyber Arcade',
    category: 'ACTION FPS',
    rating: 4.8,
    price: 44.99,
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
    tag: 'CHALLENGING',
  },
  {
    title: 'Starlight Voyage',
    category: 'PLATFORMER',
    rating: 4.9,
    price: 9.99,
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80',
    tag: 'INDIE',
  },
  {
    title: 'Battle Protocol',
    category: 'MOBA',
    rating: 4.3,
    free: true,
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    tag: 'FREE TO PLAY',
  },
  {
    title: 'Stone Fortress',
    category: 'ACTION FPS',
    rating: 4.7,
    price: 29.99,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    tag: 'CO-OP',
  },
  {
    title: 'Retro Console',
    category: 'JRPG',
    rating: 4.9,
    price: 19.99,
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    tag: 'LEGENDARY',
  },
  {
    title: 'Among Friends',
    category: 'PARTY',
    rating: 4.1,
    price: 4.99,
    imageUrl: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=400&q=80',
    tag: 'MULTIPLAYER',
  },
];

export const MoreGames: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('ALL');

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.subtitle}>
          <span className={styles.subtitleLine} />
          RECOMMENDED FOR YOU
          <span className={styles.subtitleLine} />
        </div>
        <h2 className={styles.title}>
          MORE
          <br />
          <span className={styles.titleAccent}>GAMES</span>
        </h2>

        <div className={styles.categoryFilters}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.categoryBtn} ${activeCategory === cat ? styles.categoryBtnActive : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Orange dividing line with Eye of Horus icon in center */}
      <div className={styles.separatorWrap}>
        <div className={styles.separatorLine} />
        <div className={styles.separatorIcon}>
          <EyeOfHorusIcon />
        </div>
        <div className={styles.separatorLine} />
      </div>

      <div className={styles.grid}>
        {allGames.map((game, index) => (
          <GameCard key={index} {...game} showAddButton={false} />
        ))}
      </div>

      <div className={styles.browseMoreWrap}>
        <button className={styles.browseMoreBtn}>BROWSE ALL GAMES</button>
      </div>
    </section>
  );
};
