import { and, eq, gt } from "drizzle-orm";
import { sessions } from "@lattice/db";
import { parse as parseCookieHeader } from "cookie";
import { AUTH_SESSION_TOKEN_KEYS } from "@lib/constants";
import type { db } from "@lib/drizzle";
import { AppError } from "@lib/errors";

type DB = typeof db;

export type AuthContext = {
  userId: string;
};

export function parseSessionToken(headers: Headers): string | null {
  const authHeader = headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      return token;
    }
  }

  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const cookieMap = parseCookieHeader(cookieHeader);

  for (const key of AUTH_SESSION_TOKEN_KEYS) {
    const token = cookieMap[key];
    if (token) {
      return token;
    }
  }

  return null;
}

export async function requireAuth(headers: Headers, database: DB): Promise<AuthContext> {
  const sessionToken = parseSessionToken(headers);
  if (!sessionToken) {
    throw new AppError("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  }

  const session = await database.query.sessions.findFirst({
    where: and(eq(sessions.token, sessionToken), gt(sessions.expiresAt, new Date())),
    columns: {
      userId: true,
    },
  });

  if (!session) {
    throw new AppError("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  }

  return {
    userId: session.userId,
  };
}
