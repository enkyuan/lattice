import { createFileRoute } from '@tanstack/react-router';
import { WorkspaceSettingsPage } from '@pages/settings/workspace/workspace-page';

export const Route = createFileRoute('/app/settings/workspace')({
  component: WorkspaceSettingsPage,
});
