import { createFileRoute } from '@tanstack/react-router';
import { SecuritySettingsPage } from '@pages/settings/security/security-page';

export const Route = createFileRoute('/app/settings/security')({
  component: SecuritySettingsPage,
});
