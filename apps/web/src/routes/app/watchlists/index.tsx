import { createFileRoute } from '@tanstack/react-router';
import { WatchlistsPage } from '@pages/watchlists/watchlists-page';

export const Route = createFileRoute('/app/watchlists/')({
  component: WatchlistsPage,
});
