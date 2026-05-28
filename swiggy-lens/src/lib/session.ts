import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  codeVerifier?: string;
  oauthState?: string;
  oauthClientId?: string;
  oauthClientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  isLoggedIn?: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "development-only-secret-min-32-chars-long",
  cookieName: "swiggy_lens_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

export function isSessionConfigured(): boolean {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && secret.length >= 32) {
    return true;
  }
  return process.env.NODE_ENV === "development";
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export function isAccessTokenValid(session: SessionData): boolean {
  if (!session.accessToken || !session.expiresAt) {
    return false;
  }

  return session.expiresAt > Date.now();
}

export async function clearAuthSession(session: IronSession<SessionData>) {
  delete session.codeVerifier;
  delete session.oauthState;
  delete session.oauthClientId;
  delete session.oauthClientSecret;
  delete session.accessToken;
  delete session.refreshToken;
  delete session.expiresAt;
  session.isLoggedIn = false;
  await session.save();
}
