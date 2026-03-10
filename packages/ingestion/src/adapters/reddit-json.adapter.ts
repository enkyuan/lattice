import type {
  FetchResult,
  IngestedEvent,
  IngestionAdapter,
  NormalizedSignal,
} from "..";

interface RedditResponse {
  data: {
    children: Array<{
      data: {
        name: string;
        author: string;
        title: string;
        selftext?: string;
        permalink: string;
        created_utc: number;
        subreddit: string;
        ups?: number;
        num_comments?: number;
        is_video?: boolean;
      };
    }>;
    after?: string;
  };
}

export class RedditJsonAdapter implements IngestionAdapter {
  readonly kind = "reddit";

  async fetch(query: string, options?: { cursor?: string; limit?: number }): Promise<FetchResult> {
    const url = new URL(`https://www.reddit.com/r/${query}/new.json`);
    if (options?.cursor) url.searchParams.set("after", options.cursor);
    if (options?.limit) url.searchParams.set("limit", options.limit.toString());

    const response = await fetch(url.toString(), {
      headers: { "User-Agent": "Lattice/1.0.0" },
    });

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.statusText}`);
    }

    const data = (await response.json()) as RedditResponse;
    const children = data.data.children || [];

    const events: IngestedEvent[] = children.map((child) => ({
      sourceKind: "reddit",
      sourceEventId: child.data.name,
      payload: child.data,
      fetchedAt: new Date(),
    }));

    return {
      events,
      cursor: data.data.after,
    };
  }

  normalize(event: IngestedEvent): NormalizedSignal {
    if (event.sourceKind !== "reddit") {
      throw new Error("Invalid source kind for Reddit adapter");
    }
    const p = event.payload;
    const publishedAt = new Date(p.created_utc * 1000);

    return {
      sourceKind: "reddit",
      sourceEventId: event.sourceEventId,
      authorHandle: p.author,
      authorName: null,
      bodyText: p.selftext || p.title,
      canonicalUrl: `https://reddit.com${p.permalink}`,
      publishedAt,
      normalizedJson: {
        subreddit: p.subreddit,
        ups: p.ups,
        num_comments: p.num_comments,
        is_video: p.is_video,
      },
      dedupeKey: `reddit:${event.sourceEventId}`,
    };
  }
}
