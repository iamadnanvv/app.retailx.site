import { createMiddleware } from "@tanstack/react-start";

/**
 * Attaches the signed-in Clerk session token to every server function call so
 * the server can verify who is calling.
 */
export const attachClerkAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
  if (typeof window === "undefined") return next();
  const clerk = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk;
  try {
    const token = await clerk?.session?.getToken();
    if (token) return next({ headers: { Authorization: `Bearer ${token}` } });
  } catch {
    /* not signed in yet */
  }
  return next();
});
