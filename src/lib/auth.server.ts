/**
 * Server-side Clerk session verification.
 *
 * The browser sends the Clerk session JWT as a bearer token on every server
 * function call (see `src/start.ts`). We verify it against Clerk's public
 * JWKS — no secret key required — and derive a stable user identity from it.
 */
import { createRemoteJWKSet, jwtVerify } from "jose";
import { CLERK_PUBLISHABLE_KEY } from "./clerk";

function clerkIssuer(): string {
  // pk_test_<base64 of "domain$">
  const encoded = CLERK_PUBLISHABLE_KEY.split("_").slice(2).join("_");
  const decoded = atob(encoded).replace(/\$+$/, "");
  return `https://${decoded}`;
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function keySet() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${clerkIssuer()}/.well-known/jwks.json`));
  }
  return jwks;
}

export type SessionUser = {
  userId: string;
  email: string | null;
  name: string | null;
  imageUrl: string | null;
};

export async function verifySessionToken(token: string | null | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, keySet(), { issuer: clerkIssuer() });
    const sub = typeof payload.sub === "string" ? payload.sub : null;
    if (!sub) return null;
    const claims = payload as Record<string, unknown>;
    const str = (k: string) => (typeof claims[k] === "string" ? (claims[k] as string) : null);
    return {
      userId: sub,
      email: str("email") ?? str("primary_email_address") ?? null,
      name: str("name") ?? str("full_name") ?? str("username") ?? null,
      imageUrl: str("image_url") ?? str("picture") ?? null,
    };
  } catch {
    return null;
  }
}
