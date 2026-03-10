'use client';

import { createContext, useContext, useMemo } from 'react';
import type { authClient } from '@lib/auth-client';

// ── Types ─────────────────────────────────────────────────────────────────────

type SessionData = NonNullable<ReturnType<typeof authClient.useSession>['data']>;

export interface AuthState {
  user: SessionData['user'] | null;
  session: SessionData | null;
  isPending: boolean;
  isAuthenticated: boolean;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  isPending: true,
  isAuthenticated: false,
});

// ── Provider ──────────────────────────────────────────────────────────────────

/**
 * Mount this high in the tree (in __root.tsx).
 * Child routes read auth state via `useAuth()`.
 */
export default function AuthProvider({
  children,
  session: initialSession,
}: {
  children: React.ReactNode;
  session: SessionData | null;
}) {
  // On the client, Better Auth's useSession will keep things in sync (e.g. after login/logout)
  // but we initialize it with the session from the router context to avoid hydration flickers.
  // Note: authClient.useSession() is reactive.

  const value: AuthState = useMemo(
    () => ({
      session: initialSession,
      user: initialSession?.user ?? null,
      isPending: false, // Since we provide the session from context, it's not pending
      isAuthenticated: !!initialSession?.user,
    }),
    [initialSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Read current auth state from any component inside AuthProvider.
 */
export function useAuth(): AuthState {
  return useContext(AuthContext);
}
