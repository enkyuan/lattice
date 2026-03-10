import { pgTable, text, timestamp, boolean, jsonb, doublePrecision } from 'drizzle-orm/pg-core';

// --- Auth and Multi-Tenant ---
// users table must match better-auth's expected model fields exactly
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Required by better-auth
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

// Required by better-auth
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Required by better-auth
export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const organizations = pgTable('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  plan: text('plan').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const memberships = pgTable('memberships', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
});

// --- Ingestion ---
export const sources = pgTable('sources', {
  id: text('id').primaryKey(),
  kind: text('kind').notNull(), // e.g., 'reddit', 'x'
  accountHandle: text('account_handle').notNull(),
  configJson: jsonb('config_json'),
  status: text('status').notNull(),
});

export const rawEvents = pgTable('raw_events', {
  id: text('id').primaryKey(),
  sourceKind: text('source_kind').notNull(),
  sourceEventId: text('source_event_id').notNull(),
  rawBlobUrl: text('raw_blob_url'),
  payloadJson: jsonb('payload_json').notNull(),
  fetchedAt: timestamp('fetched_at').defaultNow().notNull(),
  dedupeKey: text('dedupe_key').notNull(),
});

// --- Configuration ---
export const icpProfiles = pgTable('icp_profiles', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  personaJson: jsonb('persona_json'),
  keywordsJson: jsonb('keywords_json'),
  exclusionsJson: jsonb('exclusions_json'),
  geographyJson: jsonb('geography_json'),
  companyFiltersJson: jsonb('company_filters_json'),
});

export const watchlists = pgTable('watchlists', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  queryJson: jsonb('query_json').notNull(),
  active: boolean('active').default(true).notNull(),
});

// --- Core Domain ---
export const signals = pgTable('signals', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').references(() => organizations.id, {
    onDelete: 'cascade',
  }), // nullable
  sourceKind: text('source_kind').notNull(),
  sourceEventId: text('source_event_id').notNull(),
  authorHandle: text('author_handle'),
  authorName: text('author_name'),
  bodyText: text('body_text').notNull(),
  canonicalUrl: text('canonical_url').notNull(),
  publishedAt: timestamp('published_at').notNull(),
  normalizedJson: jsonb('normalized_json'),
  dedupeKey: text('dedupe_key').notNull(),
});

export const signalScores = pgTable('signal_scores', {
  id: text('id').primaryKey(),
  signalId: text('signal_id')
    .notNull()
    .references(() => signals.id, { onDelete: 'cascade' }),
  icpProfileId: text('icp_profile_id')
    .notNull()
    .references(() => icpProfiles.id, { onDelete: 'cascade' }),
  feasibilityScore: doublePrecision('feasibility_score'), // nullable
  relevanceScore: doublePrecision('relevance_score').notNull(),
  urgencyScore: doublePrecision('urgency_score').notNull(),
  painScore: doublePrecision('pain_score').notNull(),
  blastRadiusScore: doublePrecision('blast_radius_score').notNull(),
  intentScore: doublePrecision('intent_score').notNull(),
  finalRankScore: doublePrecision('final_rank_score').notNull(),
  scoredAt: timestamp('scored_at').defaultNow().notNull(),
});

export const recommendations = pgTable('recommendations', {
  id: text('id').primaryKey(),
  signalId: text('signal_id')
    .notNull()
    .references(() => signals.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  recommendationType: text('recommendation_type').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  confidence: doublePrecision('confidence').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const actions = pgTable('actions', {
  id: text('id').primaryKey(),
  signalId: text('signal_id')
    .notNull()
    .references(() => signals.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  actorUserId: text('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
  actionType: text('action_type').notNull(),
  status: text('status').notNull(),
  contentJson: jsonb('content_json').notNull(),
  externalRef: text('external_ref'), // nullable
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const outcomes = pgTable('outcomes', {
  id: text('id').primaryKey(),
  actionId: text('action_id')
    .notNull()
    .references(() => actions.id, { onDelete: 'cascade' }),
  outcomeType: text('outcome_type').notNull(),
  valueJson: jsonb('value_json'),
  observedAt: timestamp('observed_at').defaultNow().notNull(),
});

export const drafts = pgTable('drafts', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  sourceSignalIdsJson: jsonb('source_signal_ids_json').notNull(),
  draftType: text('draft_type').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const analyticsEvents = pgTable('analytics_events', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  eventName: text('event_name').notNull(),
  subjectType: text('subject_type').notNull(),
  subjectId: text('subject_id').notNull(),
  payloadJson: jsonb('payload_json'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
