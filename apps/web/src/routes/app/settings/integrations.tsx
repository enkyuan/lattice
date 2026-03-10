import { createFileRoute } from '@tanstack/react-router';
import { IntegrationsSettingsPage } from '@pages/settings/integrations/integrations-page';

export const Route = createFileRoute('/app/settings/integrations')({
  component: IntegrationsSettingsPage,
});
