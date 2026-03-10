import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';

import { auth } from '@lib/auth';

export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    return session;
  } catch (error) {
    const code =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code?: unknown }).code === 'string'
        ? (error as { code: string }).code
        : undefined;

    if (code === '42P01') {
      console.error('[auth.getSession] missing auth relation (42P01). Returning null session.');
      return null;
    }

    throw error;
  }
});

export const ensureSession = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
});
