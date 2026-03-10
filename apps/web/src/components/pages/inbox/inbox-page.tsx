import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AppShell } from '../app-shell';
import { getInboxSignalDetail, getInboxSignals } from '@lib/inbox-functions';
import { Route } from '@/routes/app/inbox';
import { Filter2Fill } from '@mingcute/react';
import { Checkbox, Separator } from '@lattice/ui';

export function InboxPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  const selectedSignalId = search.signalId;

  const inboxQuery = useQuery({
    queryKey: ['inbox', 'signals', search.source, search.status, search.search, search.sort],
    queryFn: () =>
      getInboxSignals({
        data: {
          source: search.source,
          status: search.status,
          search: search.search,
          sort: search.sort,
        },
      }),
  });

  const detailQuery = useQuery({
    queryKey: ['inbox', 'signal-detail', selectedSignalId],
    enabled: Boolean(selectedSignalId),
    queryFn: () =>
      getInboxSignalDetail({
        data: {
          signalId: selectedSignalId!,
        },
      }),
  });

  const newSignalsCount =
    inboxQuery.data?.items.filter((signal) => signal.state === 'new').length ?? 0;

  return (
    <AppShell
      title="Inbox"
      searchValue={search.search ?? ''}
      onSearchChange={(value) => {
        void navigate({
          to: '/app/inbox',
          search: (prev) => ({
            ...prev,
            search: value.length > 0 ? value : undefined,
          }),
          replace: true,
        });
      }}
      rightPane={
        !selectedSignalId ? (
          <p className="text-sm text-muted-foreground">Select a signal to view details.</p>
        ) : detailQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Loading signal detail...</p>
        ) : detailQuery.isError ? (
          <p className="text-sm text-destructive-foreground">Failed to load signal detail.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {detailQuery.data.signal.sourceKind}
            </p>
            <p className="text-sm font-medium">@{detailQuery.data.signal.authorHandle}</p>
            <p className="text-sm text-muted-foreground">{detailQuery.data.signal.bodyText}</p>
            <a
              href={detailQuery.data.signal.canonicalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted-foreground underline"
            >
              Open source conversation
            </a>
          </div>
        )
      }
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-2">
            {/* TODO: Wire this checkbox to bulk-select and bulk-action behavior for inbox signals. */}
            <Checkbox aria-label="Select all inbox signals" />
            <p className="text-sm font-semibold">{newSignalsCount}</p>
          </div>
          {/* TODO: Connect this filter button to inbox filter controls and saved views. */}
          <button
            type="button"
            aria-label="Filter inbox signals"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            <Filter2Fill className="size-4" />
          </button>
        </div>
        <div className="-mx-4">
          <Separator />
        </div>
        <div className="relative min-h-0 flex-1 pt-3">
          {inboxQuery.isPending ? (
            <p className="text-sm text-muted-foreground">Loading signals...</p>
          ) : inboxQuery.isError ? (
            <p className="text-sm text-destructive-foreground">Failed to load inbox signals.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {inboxQuery.data.items.map((signal) => (
                <li
                  key={signal.id}
                  className={`cursor-pointer rounded-md p-3 transition-colors ${
                    selectedSignalId === signal.id ? 'bg-background' : 'bg-background/60'
                  }`}
                  onClick={() => {
                    void navigate({
                      to: '/app/inbox',
                      search: (prev) => ({
                        ...prev,
                        signalId: signal.id,
                      }),
                    });
                  }}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">@{signal.authorHandle}</p>
                    <p className="text-xs text-muted-foreground">{signal.sourceKind}</p>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{signal.bodyText}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>intent {signal.intentScore.toFixed(2)}</span>
                    <span>pain {signal.painScore.toFixed(2)}</span>
                    <span>rank {signal.finalRankScore.toFixed(2)}</span>
                    <span>{signal.state}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
