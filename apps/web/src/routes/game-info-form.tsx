import { createFileRoute } from '@tanstack/react-router';
import GameInfoFormPage from './game-info-form/GameInfoFormPage';
import { requireCreator } from '../utils/authGuard';

export const Route = createFileRoute('/game-info-form')({
  beforeLoad: ({ context, location }) => {
    requireCreator(context.auth, location.href);
  },
  component: GameInfoFormPage,
});
