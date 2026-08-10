export interface CartGame {
  id: string | number;
  gameId?: string;
  title?: string;
  genre: string;
  developer: string;
  rating: number;
  originalPrice: number;
  salePrice?: number;
  coverImage: string;
  tags: string[];
}

export interface SuggestedGame {
  id: string | number;
  title?: string;
  genre: string;
  rating: number;
  price: number;
  coverImage: string;
}
