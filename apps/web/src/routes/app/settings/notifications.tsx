import { createFileRoute } from '@tanstack/react-router';
import { NotificationsSettingsPage } from '@pages/settings/notifications/notifications-page';

export const Route = createFileRoute('/app/settings/notifications')({
  component: NotificationsSettingsPage,
});
