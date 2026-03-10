import { createFileRoute } from '@tanstack/react-router';
import { ProfileSettingsPage } from '@pages/settings/profile/profile-page';

export const Route = createFileRoute('/app/settings/profile')({
  component: ProfileSettingsPage,
});
