// Sandbox mode: backend-connected demo. A short-lived (6h) signed token, issued by
// POST /sandbox/session/start, is stored in localStorage so the session survives
// reloads/leaving the site. The API layer routes all sandbox calls to /sandbox/*
// with this token. Expiry is enforced server-side (token signature + DB session).

const TOKEN_KEY = "omnify-sb-token";
const EXP_KEY = "omnify-sb-exp"; // epoch ms
const USER_KEY = "omnify-sb-user";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
// Sandbox routes live at the server root (/sandbox), not under /api.
export const SANDBOX_BASE_URL = API_BASE.replace(/\/api\/?$/, "") + "/sandbox";

export interface SandboxUser {
  name: string;
  email: string;
  role: string;
  company: string;
}

// The signed sandbox token, or null if absent/expired (client-side fast check;
// the server is still authoritative on every request).
export const getSandboxToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const t = localStorage.getItem(TOKEN_KEY);
  const e = localStorage.getItem(EXP_KEY);
  if (!t || !e) return null;
  if (Date.now() >= Number(e)) return null;
  return t;
};

export const isSandbox = (): boolean => !!getSandboxToken();

// True when a (not-yet-expired) sandbox session token is present — drives the
// "continue previous session" affordance on the sandbox gate.
export const hasSandboxSession = (): boolean => !!getSandboxToken();

export const getSandboxExpiry = (): number | null => {
  const e = typeof window !== "undefined" ? localStorage.getItem(EXP_KEY) : null;
  return e ? Number(e) : null;
};

export const getSandboxUser = (): SandboxUser | null => {
  if (!isSandbox()) return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as SandboxUser) : null;
  } catch {
    return null;
  }
};

// Start a new sandbox session (clones seed server-side) and store the token.
export async function startSandbox(profile: {
  name: string;
  email: string;
  role: string;
  company: string;
}): Promise<void> {
  const res = await fetch(`${SANDBOX_BASE_URL}/session/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error("Failed to start sandbox session");
  const data = await res.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(EXP_KEY, String(new Date(data.expiresAt).getTime()));
  localStorage.setItem(USER_KEY, JSON.stringify(data.profile || profile));
}

// Confirm the stored token is still valid against the server (DB-authoritative).
export async function validateSandbox(): Promise<boolean> {
  const token = getSandboxToken();
  if (!token) return false;
  try {
    const res = await fetch(`${SANDBOX_BASE_URL}/session/me`, {
      headers: { "x-sandbox-token": token },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const disableSandbox = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXP_KEY);
  localStorage.removeItem(USER_KEY);
};
