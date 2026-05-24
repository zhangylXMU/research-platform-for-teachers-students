import * as jose from "jose";
import * as cookie from "cookie";
import { eq } from "drizzle-orm";
import { users } from "@db/schema";
import { getDb } from "./queries/connection";
import { env } from "./lib/env";

const LOCAL_AUTH_COOKIE = "local_auth_token";
const JWT_ALG = "HS256";

export async function signLocalToken(userId: number): Promise<string> {
  const secret = new TextEncoder().encode(env.jwtSecret);
  return new jose.SignJWT({ userId, type: "local" })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyLocalToken(token: string): Promise<{ userId: number } | null> {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(env.jwtSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
      clockTolerance: 60,
    });
    if (payload.type !== "local" || !payload.userId) return null;
    return { userId: payload.userId as number };
  } catch {
    return null;
  }
}

export async function authenticateLocalRequest(headers: Headers): Promise<typeof users.$inferSelect | undefined> {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[LOCAL_AUTH_COOKIE];
  if (!token) return undefined;

  const claim = await verifyLocalToken(token);
  if (!claim) return undefined;

  const rows = await getDb()
    .select()
    .from(users)
    .where(eq(users.id, claim.userId))
    .limit(1);

  return rows.at(0);
}

export function getLocalAuthCookieName(): string {
  return LOCAL_AUTH_COOKIE;
}
