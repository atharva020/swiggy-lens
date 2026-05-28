import { NextResponse } from "next/server";

import {
  buildAuthorizationUrl,
  generateOAuthState,
  generatePkcePair,
  getAppBaseUrl,
  getSwiggyOAuthConfig,
  resolveOAuthClient,
} from "@/lib/auth";
import { getSession, isSessionConfigured } from "@/lib/session";

export async function GET() {
  const baseUrl = getAppBaseUrl();
  const { redirectUri } = getSwiggyOAuthConfig();

  if (!isSessionConfigured()) {
    return NextResponse.redirect(`${baseUrl}/?error=session_not_configured`);
  }

  let clientId: string;
  let clientSecret: string | undefined;

  try {
    const resolved = await resolveOAuthClient(redirectUri);
    clientId = resolved.clientId;
    clientSecret = resolved.clientSecret;
  } catch (registrationError) {
    const message =
      registrationError instanceof Error
        ? registrationError.message
        : "dcr_failed";
    return NextResponse.redirect(
      `${baseUrl}/?error=${encodeURIComponent(message)}`
    );
  }

  const { codeVerifier, codeChallenge } = generatePkcePair();
  const state = generateOAuthState();
  const session = await getSession();

  session.codeVerifier = codeVerifier;
  session.oauthState = state;
  session.oauthClientId = clientId;
  if (clientSecret) {
    session.oauthClientSecret = clientSecret;
  }
  await session.save();

  const authUrl = buildAuthorizationUrl({
    clientId,
    redirectUri,
    codeChallenge,
    state,
  });

  return NextResponse.redirect(authUrl);
}
