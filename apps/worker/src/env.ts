import { t } from "elysia";
import { Value } from "@sinclair/typebox/value";

const EnvSchema = t.Object({
  NODE_ENV: t.Union([t.Literal("development"), t.Literal("production"), t.Literal("test")], {
    default: "development",
  }),
  DATABASE_URL: t.String({ minLength: 1 }),
  REDIS_URL: t.String({ minLength: 1 }),
  X_API_KEY: t.Optional(t.String()),
  X_API_SECRET: t.Optional(t.String()),
  X_BEARER_TOKEN: t.Optional(t.String()),
  X_BASE_URL: t.Optional(t.String()),
  
  // Reddit
  REDDIT_CLIENT_ID: t.Optional(t.String()),
  REDDIT_CLIENT_SECRET: t.Optional(t.String()),
  REDDIT_USER_AGENT: t.Optional(t.String({ default: "LatticeWorker/1.0" })),
  
  // S3 / Garage
  S3_ENDPOINT: t.Optional(t.String()),
  S3_ACCESS_KEY_ID: t.Optional(t.String()),
  S3_SECRET_ACCESS_KEY: t.Optional(t.String()),
  S3_BUCKET: t.Optional(t.String({ default: "lattice" })),
  S3_REGION: t.Optional(t.String({ default: "garage" })),
  S3_USE_SSL: t.Optional(t.Boolean({ default: false })),
});

const rawEnv = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  X_API_KEY: process.env.X_API_KEY,
  X_API_SECRET: process.env.X_API_SECRET,
  X_BEARER_TOKEN: process.env.X_BEARER_TOKEN,
  X_BASE_URL: process.env.X_BASE_URL,
  
  REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
  REDDIT_USER_AGENT: process.env.REDDIT_USER_AGENT,
  
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  S3_BUCKET: process.env.S3_BUCKET,
  S3_REGION: process.env.S3_REGION,
  S3_USE_SSL: process.env.S3_USE_SSL === "true",
};

if (!Value.Check(EnvSchema, rawEnv)) {
  const errors = [...Value.Errors(EnvSchema, rawEnv)];
  console.error("Worker: Invalid environment variables:", JSON.stringify(errors, null, 2));
  // In dev, we might not have all S3 vars yet, so we don't throw if we want to allow partial setup
  // but for production, we should probably be stricter.
  if (process.env.NODE_ENV === "production") {
    throw new Error("Invalid environment variables in production");
  }
}

export const env = Value.Cast(EnvSchema, rawEnv);
export type Env = typeof env;
