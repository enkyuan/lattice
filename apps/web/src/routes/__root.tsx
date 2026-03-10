import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router';
import { useEffect } from 'react';

import TanStackQueryProvider from '../integrations/tanstack-query/root-provider';
import PostHogProvider from '../integrations/posthog/provider';
import AuthProvider from '../integrations/better-auth/auth-provider';
import appCss from '../styles.css?url';

import type { QueryClient } from '@tanstack/react-query';
import { SidebarProvider } from '@lattice/ui';
import { getSession } from '@lib/auth-functions';

export interface MyRouterContext {
  queryClient: QueryClient;
  session: Awaited<ReturnType<typeof getSession>>;
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Lattice' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  beforeLoad: async () => {
    const session = await getSession();
    return {
      session,
    };
  },
  shellComponent: RootDocument,
  component: () => <Outlet />,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { queryClient, session } = Route.useRouteContext();

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return;
    }

    const originalInfo = console.info;
    const originalLog = console.log;

    const isReactGrabBanner = (args: unknown[]) =>
      typeof args[0] === 'string' && args[0].includes('https://react-grab.com');

    console.info = (...args: unknown[]) => {
      if (isReactGrabBanner(args)) {
        return;
      }
      originalInfo(...args);
    };

    console.log = (...args: unknown[]) => {
      if (isReactGrabBanner(args)) {
        return;
      }
      originalLog(...args);
    };

    void import('react-grab').finally(() => {
      console.info = originalInfo;
      console.log = originalLog;
    });

    return () => {
      console.info = originalInfo;
      console.log = originalLog;
    };
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="relative overflow-x-hidden font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <div className="isolate relative flex min-h-svh flex-col">
          <TanStackQueryProvider queryClient={queryClient}>
            <PostHogProvider>
              <AuthProvider session={session}>
                <SidebarProvider>{children}</SidebarProvider>
              </AuthProvider>
            </PostHogProvider>
          </TanStackQueryProvider>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
