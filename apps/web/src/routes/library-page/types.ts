export type ViewMode = 'owned' | 'pending';
export type SortOption = 'Title' | 'Rating' | 'Purchase Date';
export type GameStatus = 'up-to-date' | 'update-available' | 'not-installed';

export interface LibraryGame {
  id: number | string;
  title: string;
  genre: string;
  developer: string;
  size?: string;
  rating: number;
  status: GameStatus;
  updateVersion?: string;
  coverImage: string;
  heroImage: string;
  tags: string[];
  purchaseDate: string;
}

export interface DisplayGame {
  id: string;
  title: string;
  genre: string;
  developer: string;
  rating: number;
  coverImage: string;
  heroImage: string;
  tags: string[];
  purchaseDate: string;
  priceEgp: string;
  sourceOrderId?: string;
  isPending?: boolean;
  paymentReference?: string;
  paymentMethod?: string;
}

export interface DynamicFilterItem {
  label: string;
  count: number;
}
