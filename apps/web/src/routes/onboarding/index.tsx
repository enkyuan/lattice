import { redirect, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/onboarding/')({
  beforeLoad: () => {
    throw redirect({ to: '/onboarding/about' });
  },
});
