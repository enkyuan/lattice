import { createFileRoute } from '@tanstack/react-router';

import { LoginPage } from '@pages/auth';
import { requireGuest } from './-guards';

export const Route = createFileRoute('/login')({
  beforeLoad: requireGuest,
  component: LoginPage,
});
