import React, { useState } from 'react';
import styles from '../styles/FeaturedGames.module.css';
import { GameCard } from './GameCard';
import { EyeOfHorusIcon } from '../assets';

const featuredGamesList = [
  // Page 1 (1-3 of 6)
  {
    title: 'Cyberpunk Odyssey',
    category: 'RPG / OPEN WORLD',
    rating: 4.6,
    price: 29.99,
    oldPrice: 59.99,
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    tag: 'SALE',
    discountTag: '-60%',
  },
  {
    title: 'Controller Warfare',
    category: 'ACTION RPG',
    rating: 4.8,
    price: 49.99,
    imageUrl: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&w=600&q=80',
    tag: 'BESTSELLER',
  },
  {
    title: 'Indie Laptop Adventure',
    category: 'METROIDVANIA',
    rating: 4.4,
    price: 14.99,
    imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=600&q=80',
    tag: 'INDIE GEM',
  },
  // Page 2 (4-6 of 6)
  {
    title: 'Cosmic Rift',
    category: 'OPEN WORLD',
    rating: 4.9,
    price: 39.99,
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    tag: 'NEW ARRIVAL',
  },
  {
    title: 'Neon Cyber City',
    category: 'ACTION RPG',
    rating: 4.7,
    price: 24.99,
    oldPrice: 49.99,
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    tag: 'SALE',
    discountTag: '-50%',
  },
  {
    title: 'Retro Arcade Legends',
    category: 'PLATFORMER',
    rating: 4.5,
    price: 19.99,
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    tag: "EDITOR'S CHOICE",
  },
];

export const FeaturedGames: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);

  const handlePrev = () => {
    setPageIndex((prev) => (prev > 0 ? prev - 1 : 1));
  };

  const handleNext = () => {
    setPageIndex((prev) => (prev < 1 ? prev + 1 : 0));
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.subtitle}>
          <span className={styles.subtitleLine} />
          EDITOR'S PICKS
          <span className={styles.subtitleLine} />
        </div>
        <h2 className={styles.title}>
          FEATURED
          <br />
          <span className={styles.titleAccent}>GAMES</span>
        </h2>

        <div className={styles.carouselControls}>
          <span className={styles.counter}>— 0{pageIndex + 1}</span>
          <div className={styles.arrows}>
            <button className={styles.arrowBtn} onClick={handlePrev} aria-label="Previous page">
              &lt;
            </button>
            <button className={styles.arrowBtn} onClick={handleNext} aria-label="Next page">
              &gt;
            </button>
          </div>
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

      {/* Smooth Horizontal Carousel Track */}
      <div className={styles.carouselTrackWrapper}>
        <div
          className={styles.carouselTrack}
          style={{
            transform: pageIndex === 0 ? 'translateX(0%)' : 'translateX(calc(-100% - 1.5rem))',
          }}
        >
          {featuredGamesList.map((game, index) => (
            <div key={index} className={styles.carouselItem}>
              <GameCard {...game} showAddButton={true} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.paginationInfo}>
        {pageIndex * 3 + 1}-{pageIndex * 3 + 3} of {featuredGamesList.length} games
      </div>
    </section>
  );
};
