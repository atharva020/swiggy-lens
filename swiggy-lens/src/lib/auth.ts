import crypto from "node:crypto";

export const SWIGGY_AUTHORIZE_URL = "https://mcp.swiggy.com/auth/authorize";
export const SWIGGY_TOKEN_URL = "https://mcp.swiggy.com/auth/token";
export const SWIGGY_OAUTH_SCOPES = "mcp:tools mcp:resources mcp:prompts";

export interface SwiggyOAuthConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUri: string;
}

export interface SwiggyTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

export function generatePkcePair() {
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  return { codeVerifier, codeChallenge };
}

export function generateOAuthState() {
  return crypto.randomBytes(16).toString("base64url");
}

export function getSwiggyOAuthConfig(): SwiggyOAuthConfig {
  return {
    clientId: process.env.SWIGGY_CLIENT_ID?.trim(),
    clientSecret: process.env.SWIGGY_CLIENT_SECRET?.trim(),
    redirectUri:
      process.env.SWIGGY_REDIRECT_URI?.trim() ??
      "http://localhost:3000/api/auth/callback",
  };
}

export function getAppBaseUrl() {
  return process.env.NEXTAUTH_URL?.trim() ?? "http://localhost:3000";
}

export function buildAuthorizationUrl(params: {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string;
}) {
  const url = new URL(SWIGGY_AUTHORIZE_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", params.state);
  url.searchParams.set("scope", SWIGGY_OAUTH_SCOPES);
  return url.toString();
}

export async function exchangeAuthorizationCode(params: {
  code: string;
  codeVerifier: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
}): Promise<SwiggyTokenResponse> {
  const body: Record<string, string> = {
    grant_type: "authorization_code",
    code: params.code,
    code_verifier: params.codeVerifier,
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
  };

  if (params.clientSecret) {
    body.client_secret = params.clientSecret;
  }

  const response = await fetch(SWIGGY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Swiggy token exchange failed (${response.status}): ${errorBody}`
    );
  }

  return response.json() as Promise<SwiggyTokenResponse>;
}
