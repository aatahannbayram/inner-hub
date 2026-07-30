const clientId = process.env.LINKEDIN_CLIENT_ID;
const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

export const linkedinEnabled = Boolean(clientId && clientSecret);

function appUrl(): string {
  return (process.env.APP_URL ?? "https://inner.digital").replace(/\/$/, "");
}

export function linkedinRedirectUri(): string {
  return `${appUrl()}/api/auth/linkedin/callback`;
}

export function linkedinAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId ?? "",
    redirect_uri: linkedinRedirectUri(),
    state,
    scope: "openid profile email",
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

export type LinkedinProfile = {
  sub: string;
  name: string | null;
  email: string | null;
  picture: string | null;
};

/** Authorization code'u access token'a çevirir, sonra OIDC userinfo'yu çeker. */
export async function fetchLinkedinProfile(code: string): Promise<LinkedinProfile> {
  if (!clientId || !clientSecret) {
    throw new Error("LinkedIn yapılandırılmadı");
  }

  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: linkedinRedirectUri(),
      client_id: clientId,
      client_secret: clientSecret,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!tokenRes.ok) {
    throw new Error(`LinkedIn token exchange başarısız (${tokenRes.status})`);
  }
  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  if (!tokenJson.access_token) {
    throw new Error("LinkedIn access_token alınamadı");
  }

  const infoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!infoRes.ok) {
    throw new Error(`LinkedIn userinfo başarısız (${infoRes.status})`);
  }
  const info = (await infoRes.json()) as {
    sub?: string;
    name?: string;
    email?: string;
    picture?: string;
  };
  if (!info.sub) {
    throw new Error("LinkedIn kimliği alınamadı");
  }

  return {
    sub: info.sub,
    name: info.name ?? null,
    email: info.email ?? null,
    picture: info.picture ?? null,
  };
}
