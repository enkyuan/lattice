import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/onboarding/finish')({
  component: OnboardingFinishPage,
});

function OnboardingFinishPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <p className="text-sm text-muted-foreground">Onboarding finish step placeholder.</p>
    </main>
  );
}
