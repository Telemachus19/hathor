export type SortPreset = 'trending' | 'top_rated' | 'new_arrivals';

export interface GenreItem {
  id?: number;
  name: string;
  slug: string;
}

export interface TagItem {
  id?: number;
  name: string;
  slug: string;
}

export interface SearchFilterState {
  q: string;
  sort: SortPreset;
  genres: string[]; // slugs
  tags: string[]; // slugs
}
