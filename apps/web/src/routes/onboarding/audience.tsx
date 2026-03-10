import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/onboarding/audience')({
  component: OnboardingAudiencePage,
});

function OnboardingAudiencePage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <p className="text-sm text-muted-foreground">Onboarding audience step placeholder.</p>
    </main>
  );
}
