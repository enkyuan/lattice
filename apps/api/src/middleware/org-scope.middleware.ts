import { and, asc, eq } from "drizzle-orm";
import { memberships } from "@lattice/db";
import type { db } from "@lib/drizzle";
import { AppError } from "@lib/errors";

type DB = typeof db;

export async function requireOrgScope(database: DB, userId: string, requestedOrgId?: string | null) {
  const membership = requestedOrgId
    ? await database.query.memberships.findFirst({
        where: and(eq(memberships.userId, userId), eq(memberships.organizationId, requestedOrgId)),
        columns: {
          organizationId: true,
        },
      })
    : await database.query.memberships.findFirst({
        where: eq(memberships.userId, userId),
        orderBy: [asc(memberships.id)],
        columns: {
          organizationId: true,
        },
      });

  if (!membership) {
    throw new AppError("Missing organization membership", {
      status: 403,
      code: "MISSING_ORG_SCOPE",
    });
  }

  return {
    organizationId: membership.organizationId,
  };
}
