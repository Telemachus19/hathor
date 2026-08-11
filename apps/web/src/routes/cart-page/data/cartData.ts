import { CartGame, SuggestedGame } from '../types';

export const initialCartGames: CartGame[] = [
  {
    id: 1,
    title: 'ELDEN THRONE',
    genre: 'Action RPG',
    developer: 'FromSoftware',
    rating: 4.9,
    originalPrice: 2999,
    coverImage:
      'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=480&h=270&fit=crop&auto=format',
    tags: ['Challenging', 'Open World', 'Fantasy'],
  },
  {
    id: 2,
    title: 'NEON RUNNER 2077',
    genre: 'RPG / Open World',
    developer: 'CD Projekt Red',
    rating: 4.6,
    originalPrice: 2499,
    salePrice: 999,
    coverImage:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=480&h=270&fit=crop&auto=format',
    tags: ['Cyberpunk', 'FPS', 'Story Rich'],
  },
  {
    id: 3,
    title: 'VOID KNIGHT',
    genre: 'Metroidvania',
    developer: 'Team Cherry',
    rating: 4.8,
    originalPrice: 749,
    coverImage:
      'https://images.unsplash.com/photo-1556438064-2d7646166914?w=480&h=270&fit=crop&auto=format',
    tags: ['Indie', 'Platformer', 'Dark'],
  },
];

export const initialSuggestedGames: SuggestedGame[] = [
  {
    id: 10,
    title: 'SHADOW OF PHARAOH',
    genre: 'Action Adventure',
    rating: 4.8,
    price: 2499,
    coverImage:
      'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=480&h=270&fit=crop&auto=format',
  },
  {
    id: 11,
    title: 'ABYSS RUNNER',
    genre: 'Roguelike',
    rating: 4.9,
    price: 1249,
    coverImage:
      'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=480&h=270&fit=crop&auto=format',
  },
  {
    id: 12,
    title: 'CYBER TACTICS',
    genre: 'RPG',
    rating: 4.9,
    price: 1999,
    coverImage:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=480&h=270&fit=crop&auto=format',
  },
  {
    id: 13,
    title: 'REALMS OF RA',
    genre: 'CRPG',
    rating: 5.0,
    price: 2999,
    coverImage:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=480&h=270&fit=crop&auto=format',
  },
];
