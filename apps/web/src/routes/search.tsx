import { createFileRoute } from '@tanstack/react-router';
import SearchPage from './search-page';

interface SearchQueryParams {
  q?: string;
  sort?: string;
  genre?: string;
  tag?: string;
  tags?: string;
}

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>): SearchQueryParams => {
    return {
      q: typeof search.q === 'string' ? search.q : undefined,
      sort: typeof search.sort === 'string' ? search.sort : undefined,
      genre: typeof search.genre === 'string' ? search.genre : undefined,
      tag: typeof search.tag === 'string' ? search.tag : undefined,
      tags: typeof search.tags === 'string' ? search.tags : undefined,
    };
  },
  component: SearchPage,
});
