import { createFileRoute } from '@tanstack/react-router';
import { OutcomesPage } from '@pages/outcomes/outcomes-page';

export const Route = createFileRoute('/app/outcomes/$outcomeId')({
  component: OutcomesPage,
});
