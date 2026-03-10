import { createFileRoute } from '@tanstack/react-router';
import { DraftsPage } from '@pages/drafts/drafts-page';

export const Route = createFileRoute('/app/drafts/')({
  component: DraftsPage,
});
