import { createContext, useContext, useState, useCallback } from "react";
import { authApi } from "../api/endpoints";
import { tokenStore } from "../api/client";

const AuthContext = createContext(null);

function decode(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(tokenStore.get());
  const claims = token ? decode(token) : null;
  const user = claims ? { username: claims.sub, role: claims.role || claims.roles?.[0] } : null;

  const login = useCallback(async (username, password) => {
    const res = await authApi.login(username, password);
    // Backend is expected to return { token } (or { accessToken })
    const t = res.token || res.accessToken || res.jwt;
    if (!t) throw new Error("Login response did not include a token");
    tokenStore.set(t);
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isAuthed: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
