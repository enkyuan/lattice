import { t } from "elysia";
import { Value } from "@sinclair/typebox/value";

const EnvSchema = t.Object({
  NODE_ENV: t.Union([t.Literal("development"), t.Literal("production"), t.Literal("test")], {
    default: "development",
  }),
  PORT: t.Numeric({ default: 3000 }),
  DATABASE_URL: t.String({ minLength: 1 }),
  REDIS_URL: t.String({ minLength: 1 }),
  WEB_ORIGIN: t.String({ minLength: 1 }),
});

const rawEnv = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL:
    process.env.REDIS_URL ??
    (process.env.NODE_ENV === "production" ? undefined : "redis://redis:6379"),
  WEB_ORIGIN:
    process.env.WEB_ORIGIN ??
    (process.env.NODE_ENV === "production" ? undefined : "http://localhost:5173"),
};

if (!Value.Check(EnvSchema, rawEnv)) {
  const errors = [...Value.Errors(EnvSchema, rawEnv)];
  console.error("❌ Invalid environment variables:", JSON.stringify(errors, null, 2));
  throw new Error("Invalid environment variables");
}

export const env = Value.Cast(EnvSchema, rawEnv);
