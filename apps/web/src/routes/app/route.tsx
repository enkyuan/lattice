import { Outlet, createFileRoute } from '@tanstack/react-router';

import { requireAuth } from '../-guards';

export const Route = createFileRoute('/app')({
  beforeLoad: requireAuth,
  notFoundComponent: () => <p>Not Found</p>,
  component: Outlet,
});
