import { createFileRoute } from '@tanstack/react-router';
import { WatchlistsPage } from '@pages/watchlists/watchlists-page';

export const Route = createFileRoute('/app/watchlists/$watchlistId')({
  component: WatchlistsPage, // Reusing list page for now, or could create detail
});
