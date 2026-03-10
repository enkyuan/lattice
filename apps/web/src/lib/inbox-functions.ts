import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';

export type InboxSignal = {
  id: string;
  sourceKind: 'reddit' | 'x';
  authorHandle: string;
  bodyText: string;
  canonicalUrl: string;
  publishedAt: string;
  intentScore: number;
  painScore: number;
  relevanceScore: number;
  finalRankScore: number;
  recommendation: string;
  state: 'new' | 'saved' | 'dismissed' | 'replied' | 'converted';
};

type InboxResponse = {
  items: InboxSignal[];
  total: number;
  limit: number;
  offset: number;
};

type InboxDetailResponse = {
  signal: {
    id: string;
    sourceKind: 'reddit' | 'x';
    authorHandle: string;
    bodyText: string;
    canonicalUrl: string;
    publishedAt: string;
  };
};

type GetInboxSignalsInput = {
  source?: 'reddit' | 'x';
  status?: 'new' | 'saved' | 'dismissed' | 'replied' | 'converted';
  search?: string;
  sort?: 'rank' | 'recent';
};

type UpdateInboxSignalStateInput = {
  signalId: string;
  state: 'saved' | 'dismissed' | 'replied' | 'converted';
};

type UpdateInboxSignalStateResponse = {
  signalId: string;
  state: 'saved' | 'dismissed' | 'replied' | 'converted';
  actionId: string;
  updatedAt: string;
};

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000';

function buildAuthHeaders() {
  const headers = getRequestHeaders();
  const cookie = headers.cookie;
  const authorization = headers.authorization;

  return {
    ...(cookie ? { cookie } : {}),
    ...(authorization ? { authorization } : {}),
  };
}

export const getInboxSignals = createServerFn({ method: 'GET' })
  .inputValidator((input: GetInboxSignalsInput) => input)
  .handler(async ({ data }) => {
    const params = new URLSearchParams();
    if (data.source) {
      params.set('source', data.source);
    }
    if (data.status) {
      params.set('status', data.status);
    }
    if (data.search) {
      params.set('search', data.search);
    }
    if (data.sort) {
      params.set('sort', data.sort);
    }

    const response = await fetch(`${API_BASE_URL}/api/inbox?${params.toString()}`, {
      headers: buildAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Inbox API failed with status ${response.status}`);
    }

    return (await response.json()) as InboxResponse;
  });

export const getInboxSignalDetail = createServerFn({ method: 'GET' })
  .inputValidator((input: { signalId: string }) => input)
  .handler(async ({ data }) => {
    const response = await fetch(`${API_BASE_URL}/api/inbox/${encodeURIComponent(data.signalId)}`, {
      headers: buildAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Inbox detail API failed with status ${response.status}`);
    }

    return (await response.json()) as InboxDetailResponse;
  });

export const updateInboxSignalState = createServerFn({ method: 'POST' })
  .inputValidator((input: UpdateInboxSignalStateInput) => input)
  .handler(async ({ data }) => {
    const response = await fetch(
      `${API_BASE_URL}/api/inbox/${encodeURIComponent(data.signalId)}/state`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify({
          state: data.state,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Inbox state update failed with status ${response.status}`);
    }

    return (await response.json()) as UpdateInboxSignalStateResponse;
  });
