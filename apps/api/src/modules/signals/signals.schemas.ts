import { t } from "elysia";
import {
  INBOX_ACTIONABLE_STATES,
  INBOX_DEFAULT_LIMIT,
  INBOX_DEFAULT_OFFSET,
  INBOX_MAX_LIMIT,
  INBOX_MAX_OFFSET,
  INBOX_SORTS,
  INBOX_SOURCES,
  INBOX_STATES,
} from "./signals.constants";

export const inboxSourceSchema = t.Union(INBOX_SOURCES.map((source) => t.Literal(source)));
export const inboxStatusSchema = t.Union(INBOX_STATES.map((state) => t.Literal(state)));
export const inboxSortSchema = t.Union(INBOX_SORTS.map((sort) => t.Literal(sort)));
export const inboxActionableStateSchema = t.Union(
  INBOX_ACTIONABLE_STATES.map((state) => t.Literal(state)),
);

export const inboxQuerySchema = t.Object({
  source: t.Optional(inboxSourceSchema),
  status: t.Optional(inboxStatusSchema),
  search: t.Optional(t.String()),
  sort: t.Optional(t.Union(INBOX_SORTS.map((sort) => t.Literal(sort)), { default: "rank" })),
  limit: t.Optional(
    t.Numeric({ default: INBOX_DEFAULT_LIMIT, minimum: 1, maximum: INBOX_MAX_LIMIT }),
  ),
  offset: t.Optional(
    t.Numeric({ default: INBOX_DEFAULT_OFFSET, minimum: 0, maximum: INBOX_MAX_OFFSET }),
  ),
});

export const signalIdParamsSchema = t.Object({
  signalId: t.String(),
});

export const inboxStateBodySchema = t.Object({
  state: inboxActionableStateSchema,
});
