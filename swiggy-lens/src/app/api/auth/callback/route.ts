import { NextRequest, NextResponse } from "next/server";

import {
  exchangeAuthorizationCode,
  getAppBaseUrl,
  getSwiggyOAuthConfig,
} from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const baseUrl = getAppBaseUrl();
  const { searchParams } = request.nextUrl;
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/?error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/?error=missing_code`);
  }

  const session = await getSession();

  if (!session.oauthState || session.oauthState !== state) {
    return NextResponse.redirect(`${baseUrl}/?error=invalid_state`);
  }

  if (!session.codeVerifier) {
    return NextResponse.redirect(`${baseUrl}/?error=missing_verifier`);
  }

  const { redirectUri } = getSwiggyOAuthConfig();
  const clientId =
    session.oauthClientId ?? getSwiggyOAuthConfig().clientId ?? undefined;
  const clientSecret =
    session.oauthClientSecret ?? getSwiggyOAuthConfig().clientSecret;

  try {
    const tokenResponse = await exchangeAuthorizationCode({
      code,
      codeVerifier: session.codeVerifier,
      redirectUri,
      clientId,
      clientSecret,
    });

    session.accessToken = tokenResponse.access_token;
    session.refreshToken = tokenResponse.refresh_token;
    session.expiresAt = Date.now() + tokenResponse.expires_in * 1000;
    session.isLoggedIn = true;
    delete session.codeVerifier;
    delete session.oauthState;
    delete session.oauthClientId;
    delete session.oauthClientSecret;
    await session.save();

    return NextResponse.redirect(`${baseUrl}/?connected=1`);
  } catch (exchangeError) {
    const message =
      exchangeError instanceof Error
        ? exchangeError.message
        : "token_exchange_failed";

    return NextResponse.redirect(
      `${baseUrl}/?error=${encodeURIComponent(message)}`
    );
  }
}
