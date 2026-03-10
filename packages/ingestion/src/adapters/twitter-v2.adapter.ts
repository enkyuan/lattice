import { TwitterApi } from "twitter-api-v2";
import type { FetchResult, IngestedEvent, IngestionAdapter, NormalizedSignal } from "..";

export interface TwitterV2AdapterConfig {
  apiKey?: string;
  apiSecret?: string;
  bearerToken?: string;
  baseUrl?: string;
}

export class TwitterV2Adapter implements IngestionAdapter {
  readonly kind = "x";
  private client: TwitterApi;

  constructor(config: TwitterV2AdapterConfig) {
    if (config.bearerToken) {
      this.client = new TwitterApi(config.bearerToken);
    } else {
      this.client = new TwitterApi({
        appKey: config.apiKey ?? "",
        appSecret: config.apiSecret ?? "",
        ...(config.baseUrl ? { baseUrl: config.baseUrl } : {}),
      });
    }
  }

  async fetch(query: string, options?: { cursor?: string; limit?: number }): Promise<FetchResult> {
    const response = await this.client.v2.search(query, {
      max_results: options?.limit || 10,
      next_token: options?.cursor,
      "tweet.fields": ["created_at", "public_metrics", "entities", "author_id"],
      expansions: ["author_id"],
      "user.fields": ["username", "name"],
    });

    // DEFENSIVE CHECK (Finding 6)
    const tweets = response.data?.data || [];
    const meta = response.data?.meta;

    const events: IngestedEvent[] = tweets.map((tweet) => {
      const author = response.includes?.users?.find((u) => u.id === tweet.author_id);
      const publicMetrics = tweet.public_metrics
        ? (tweet.public_metrics as unknown as Record<string, unknown>)
        : undefined;
      const entities = tweet.entities
        ? (tweet.entities as unknown as Record<string, unknown>)
        : undefined;
      return {
        sourceKind: "x",
        sourceEventId: tweet.id,
        payload: {
          id: tweet.id,
          text: tweet.text,
          created_at: tweet.created_at || new Date().toISOString(),
          author_id: tweet.author_id,
          public_metrics: publicMetrics,
          entities,
          _author: author
            ? {
                username: author.username,
                name: author.name,
              }
            : undefined,
        },
        fetchedAt: new Date(),
      };
    });

    return {
      events,
      cursor: meta?.next_token,
    };
  }

  normalize(event: IngestedEvent): NormalizedSignal {
    if (event.sourceKind !== "x") {
      throw new Error("Invalid source kind for Twitter adapter");
    }
    const p = event.payload;
    const author = p._author;

    return {
      sourceKind: "x",
      sourceEventId: event.sourceEventId,
      authorHandle: author?.username || null,
      authorName: author?.name || null,
      bodyText: p.text,
      canonicalUrl: `https://x.com/${author?.username || "i"}/status/${event.sourceEventId}`,
      publishedAt: new Date(p.created_at),
      normalizedJson: {
        metrics: p.public_metrics,
        entities: p.entities,
      },
      dedupeKey: `x:${event.sourceEventId}`,
    };
  }
}
