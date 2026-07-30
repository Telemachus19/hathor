import { createFileRoute } from '@tanstack/react-router';
import DesignerPage from './designer-page/DesignerPage';

export const Route = createFileRoute('/designer-page')({
  component: DesignerPage,
});
