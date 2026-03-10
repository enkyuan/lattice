import { createFileRoute } from '@tanstack/react-router';
import { SignalDetailPage } from '@pages/signals/signal-detail-page';

export const Route = createFileRoute('/app/signals/$signalId')({
  component: SignalDetailPage,
});
