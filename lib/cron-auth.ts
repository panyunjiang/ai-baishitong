import { NextRequest } from "next/server";

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Validate that the request comes from an authorized cron trigger.
 * Accepts either header-based auth (X-Cron-Secret) or query param (for GitHub Actions).
 */
export function validateCronAuth(req: NextRequest): boolean {
  if (!CRON_SECRET) {
    console.error("CRON_SECRET environment variable is not set");
    return false;
  }

  const headerSecret = req.headers.get("x-cron-secret");
  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret");

  return headerSecret === CRON_SECRET || querySecret === CRON_SECRET;
}
