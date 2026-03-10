import { Outlet, createFileRoute } from '@tanstack/react-router';

import { requireAuth } from '../-guards';

export const Route = createFileRoute('/onboarding')({
  beforeLoad: requireAuth,
  component: Outlet,
});
