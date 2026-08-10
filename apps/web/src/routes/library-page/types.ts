export type GameStatus = 'up-to-date' | 'update-available' | 'not-installed';

export interface LibraryGame {
  id: number;
  title: string;
  genre: string;
  developer: string;
  size: string;
  rating: number;
  status: GameStatus;
  updateVersion?: string;
  coverImage: string;
  heroImage: string;
  tags: string[];
  purchaseDate: string;
}

export type SortOption = 'Title' | 'Rating' | 'Purchase Date';
