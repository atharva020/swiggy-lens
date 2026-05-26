import { NextResponse } from "next/server";

import { getAppBaseUrl } from "@/lib/auth";
import { getSession } from "@/lib/session";

// Dev-only: inject SWIGGY_ACCESS_TOKEN directly into session.
// Bypasses OAuth so you can test the full MCP → agent pipeline
// without a Builders Club client_id.
// Never runs in production — guarded by NODE_ENV check.
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const token = process.env.SWIGGY_ACCESS_TOKEN?.trim();
  const baseUrl = getAppBaseUrl();

  if (!token) {
    return NextResponse.redirect(
      `${baseUrl}/?error=${encodeURIComponent(
        "SWIGGY_ACCESS_TOKEN not set in .env.local"
      )}`
    );
  }

  const session = await getSession();
  session.accessToken = token;
  session.isLoggedIn = true;
  // Set a long expiry — dev token doesn't expire like OAuth tokens
  session.expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  await session.save();

  return NextResponse.redirect(`${baseUrl}/?connected=1&mode=dev`);
}
