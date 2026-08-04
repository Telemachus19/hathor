import { createFileRoute } from '@tanstack/react-router';
import GameInfoFormPage from './game-info-form/GameInfoFormPage';

export const Route = createFileRoute('/game-info-form')({
  component: GameInfoFormPage,
});
