import { Elysia } from "elysia";
import { db, pool } from "@lib/drizzle";

export const dbPlugin = new Elysia({
  name: "db.plugin",
}).decorate("db", db).decorate("pool", pool);
