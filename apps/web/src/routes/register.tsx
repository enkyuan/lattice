import { createFileRoute } from '@tanstack/react-router';
import { RegisterPage } from '@pages/auth';

import { requireGuest } from './-guards';

export const Route = createFileRoute('/register')({
  beforeLoad: requireGuest,
  component: RegisterPage,
});
