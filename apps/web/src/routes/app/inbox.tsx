import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { InboxPage } from '@pages/inbox/inbox-page';

const inboxSearchSchema = z.object({
  source: z.enum(['reddit', 'x']).optional(),
  status: z.enum(['new', 'saved', 'dismissed', 'replied', 'converted']).optional(),
  search: z.string().optional(),
  sort: z.enum(['rank', 'recent']).optional(),
  signalId: z.string().optional(),
});

export const Route = createFileRoute('/app/inbox')({
  validateSearch: (search) => inboxSearchSchema.parse(search),
  component: InboxPage,
});
