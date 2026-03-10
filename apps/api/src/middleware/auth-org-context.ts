import type { db } from "@lib/drizzle";
import { getRequestIdFromHeaders } from "@lib/request-id";
import { requireAuth } from "./auth.middleware";
import { requireOrgScope } from "./org-scope.middleware";

type DB = typeof db;

export async function resolveAuthOrg(headers: Headers, database: DB) {
  const auth = await requireAuth(headers, database);
  const requestedOrgId = headers.get("x-organization-id");
  const org = await requireOrgScope(database, auth.userId, requestedOrgId);
  const requestId = getRequestIdFromHeaders(headers);
  return { user: auth, org, requestId };
}
