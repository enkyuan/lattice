import { createFileRoute } from '@tanstack/react-router';
import { SummariesPage } from '@pages/summaries/summaries-page';

export const Route = createFileRoute('/app/summaries')({
  component: SummariesPage,
});
