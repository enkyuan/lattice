import { createFileRoute } from '@tanstack/react-router';
import { ICPSPage } from '@pages/icps/icps-page';

export const Route = createFileRoute('/app/icps/$icpId')({
  component: ICPSPage,
});
