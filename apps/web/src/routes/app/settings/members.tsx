import { createFileRoute } from '@tanstack/react-router';
import { MembersSettingsPage } from '@pages/settings/members/members-page';

export const Route = createFileRoute('/app/settings/members')({
  component: MembersSettingsPage,
});
