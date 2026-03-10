import { createFileRoute } from '@tanstack/react-router';
import { FeedbackPage } from '@pages/feedback/feedback-page';

export const Route = createFileRoute('/app/feedback')({
  component: FeedbackPage,
});
