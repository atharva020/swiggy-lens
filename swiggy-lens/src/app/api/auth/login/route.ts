import { NextResponse } from "next/server";

import {
  buildAuthorizationUrl,
  generateOAuthState,
  generatePkcePair,
  getAppBaseUrl,
  getSwiggyOAuthConfig,
} from "@/lib/auth";
import { getSession, isSessionConfigured } from "@/lib/session";

export async function GET() {
  const baseUrl = getAppBaseUrl();
  const { clientId, redirectUri } = getSwiggyOAuthConfig();

  if (!clientId) {
    return NextResponse.redirect(`${baseUrl}/?error=oauth_not_configured`);
  }

  if (!isSessionConfigured()) {
    return NextResponse.redirect(`${baseUrl}/?error=session_not_configured`);
  }

  const { codeVerifier, codeChallenge } = generatePkcePair();
  const state = generateOAuthState();
  const session = await getSession();

  session.codeVerifier = codeVerifier;
  session.oauthState = state;
  await session.save();

  const authUrl = buildAuthorizationUrl({
    clientId,
    redirectUri,
    codeChallenge,
    state,
  });

  return NextResponse.redirect(authUrl);
}
