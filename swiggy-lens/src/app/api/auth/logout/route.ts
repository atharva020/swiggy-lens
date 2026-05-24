import { NextResponse } from "next/server";

import { getAppBaseUrl } from "@/lib/auth";
import { clearAuthSession, getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  await clearAuthSession(session);
  return NextResponse.redirect(getAppBaseUrl());
}
