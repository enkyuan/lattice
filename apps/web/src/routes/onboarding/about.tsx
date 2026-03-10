import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/onboarding/about')({
  component: OnboardingAboutPage,
});

function OnboardingAboutPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <p className="text-sm text-muted-foreground">Onboarding about step placeholder.</p>
    </main>
  );
}
