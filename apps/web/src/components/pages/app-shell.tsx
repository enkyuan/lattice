import * as React from 'react';
import { CommandLine } from '@mingcute/react';
import { SidebarInset } from '@lattice/ui';
import { Input } from '@lattice/ui';
import { AppSidebar } from '@components/ui/app-sidebar';

export function AppShell({
  children,
  rightPane,
  searchValue,
  onSearchChange,
  title: _title,
}: {
  children: React.ReactNode;
  rightPane?: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  title: string;
}) {
  void _title;
  const [isMac, setIsMac] = React.useState(false);
  const [leftPanelPercent, setLeftPanelPercent] = React.useState(30);
  const [isResizing, setIsResizing] = React.useState(false);
  const splitContainerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const platform = typeof navigator !== 'undefined' ? navigator.platform : '';
    setIsMac(/Mac|iPhone|iPad|iPod/.test(platform));
  }, []);

  React.useEffect(() => {
    if (!isResizing) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const container = splitContainerRef.current;
      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      if (rect.width <= 0) {
        return;
      }

      const next = ((event.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(75, Math.max(25, next));
      setLeftPanelPercent(clamped);
    };

    const handlePointerUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isResizing]);

  return (
    <div className="flex h-full w-full overflow-x-hidden">
      <AppSidebar style={{ '--sidebar-width': '12rem' } as React.CSSProperties} />

      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        <header className="flex h-12 items-center px-4 md:px-6">
          <label className="relative mx-auto flex w-full max-w-xl items-center">
            <Input
              placeholder="Search..."
              className="h-8 w-full pr-14 text-sm bg-neutral-100 dark:bg-neutral-800"
              value={searchValue ?? ''}
              onChange={(event) => onSearchChange?.(event.target.value)}
            />
            <div className="pointer-events-none absolute right-2 inline-flex items-center text-[11px] text-muted-foreground">
              <kbd className="inline-flex h-5 items-center justify-center gap-1 rounded border border-border bg-background px-1.5">
                {isMac ? (
                  <>
                    <CommandLine className="size-3" />
                    <span className="font-semibold">K</span>
                  </>
                ) : (
                  'Ctrl K'
                )}
              </kbd>
            </div>
          </label>
        </header>

        <SidebarInset className="min-h-0 min-w-0 w-auto flex-1 bg-transparent p-0 pb-2 pr-2 md:peer-data-[variant=inset]:m-1">
          <div
            ref={splitContainerRef}
            className="grid h-full min-h-0 min-w-0 gap-0 [grid-template-columns:var(--left-pane)_8px_var(--right-pane)]"
            style={
              {
                gridTemplateColumns: `${leftPanelPercent}% 8px minmax(0, 1fr)`,
              } as React.CSSProperties
            }
          >
            <section className="h-full min-h-[320px] rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800 md:min-h-0">
              {children}
            </section>
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize panels"
              className="flex cursor-col-resize"
              onPointerDown={(event) => {
                event.preventDefault();
                setIsResizing(true);
              }}
            />
            <section className="h-full min-h-[320px] rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800 md:min-h-0">
              {rightPane ?? (
                <p className="text-sm text-muted-foreground">Select a signal to view details.</p>
              )}
            </section>
          </div>
        </SidebarInset>
      </div>
    </div>
  );
}
