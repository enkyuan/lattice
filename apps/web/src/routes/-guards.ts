import { redirect } from '@tanstack/react-router';
import type { MyRouterContext } from './__root';

/**
 * Use as `beforeLoad` on protected routes.
 * Works on both server and client using the session from context.
 */
export async function requireAuth({ context }: { context: MyRouterContext }) {
  if (!context.session?.user) {
    throw redirect({ to: '/login' });
  }
}

/**
 * Use as `beforeLoad` on guest-only routes (login, register).
 * Works on both server and client using the session from context.
 */
export async function requireGuest({ context }: { context: MyRouterContext }) {
  if (context.session?.user) {
    throw redirect({ to: '/app/inbox' });
  }
}
