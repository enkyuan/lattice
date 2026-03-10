import { createFileRoute } from '@tanstack/react-router';
import { SupportPage } from '@pages/support/support-page';

export const Route = createFileRoute('/app/support')({
  component: SupportPage,
});
