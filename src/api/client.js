const BASE = import.meta.env.VITE_API_BASE_URL || "";
const TOKEN_KEY = "pd_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // A 401 from the login call means wrong credentials, not an expired session, so let its message through.
  if (res.status === 401 && path !== "/auth/login") {
    tokenStore.clear();
    if (!location.pathname.startsWith("/login")) location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    // GlobalExceptionHandler on the backend usually returns { message } or { error }
    const msg = (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

function safeJson(t) {
  try { return JSON.parse(t); } catch { return t; }
}

export const api = {
  get: (p) => request("GET", p),
  post: (p, b) => request("POST", p, b),
  put: (p, b) => request("PUT", p, b),
  patch: (p, b) => request("PATCH", p, b),
  del: (p) => request("DELETE", p),
};
