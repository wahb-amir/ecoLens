// providers/AuthProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

type User = {
  id?: string;
  email?: string;
  role?: string;
} | null;

type FetchWithAuth = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

type AuthContextType = {
  user: User;
  setUser: (u: User) => void;
  loading: boolean;
  fetchWithAuth: FetchWithAuth;
  refreshTokens: () => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithCredentials?: (body: { email: string; password: string }) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * AuthProvider - client-side
 *
 * Behavior:
 * - On mount: if initialUser exists -> use it. Otherwise call /api/user/me
 * - fetchWithAuth: wrapper that retries once after calling /api/auth/refresh on 401
 * - refreshTokens: POST /api/auth/refresh (credentials: 'include')
 *
 * Notes:
 * - Backend endpoints are expected to set cookies (HttpOnly) on Set-Cookie.
 * - All fetches use `credentials: "include"` to allow browser to send/receive cookies.
 */
export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser?: User;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User>(initialUser ?? null);
  const [loading, setLoading] = useState<boolean>(initialUser == null);

  const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "") || "";

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      const refreshUrl = backendBase ? `${backendBase}/api/auth/refresh` : "/api/auth/refresh";
      const res = await fetch(refreshUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        return false;
      }
      return true;
    } catch (err) {
      console.error("refreshTokens error:", err);
      return false;
    }
  }, [backendBase]);

  // wrapper fetch which retries once after performing token refresh on 401
  const fetchWithAuth: FetchWithAuth = useCallback(
    async (input, init = {}) => {
      const opts: RequestInit = {
        credentials: "include",
        ...init,
      };

      const doFetch = async () => fetch(input, opts);

      let res = await doFetch();
      if (res.status !== 401) return res;

      // got 401 -> try refresh
      const refreshed = await refreshTokens();
      if (!refreshed) {
        // couldn't refresh -> return original 401
        return res;
      }

      // refresh succeeded -> retry original request once
      // Note: when body is a ReadableStream (FormData etc) this won't re-read;
      // for simple JSON / string bodies it's fine.
      res = await doFetch();
      return res;
    },
    [refreshTokens]
  );

  // Try to fetch current user on mount if initialUser not provided
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (initialUser) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const meUrl = backendBase ? `${backendBase}/api/user/me` : "/api/user/me";
        let res = await fetch(meUrl, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (res.status === 401) {
          // try refresh once
          const ok = await refreshTokens();
          if (ok) {
            res = await fetch(meUrl, {
              method: "GET",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
            });
          }
        }

        if (!mounted) return;

        if (res.ok) {
          const data = await safeJson(res);
          setUser(data?.user ?? data ?? null);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("AuthProvider: failed to fetch /api/user/me:", err);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, [initialUser, backendBase, refreshTokens]);

  // Basic logout helper: call backend logout endpoint and clear client user state
  const logout = useCallback(async () => {
    try {
      const logoutUrl = backendBase ? `${backendBase}/api/auth/logout` : "/api/auth/logout";
      await fetch(logoutUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("logout error:", err);
    } finally {
      setUser(null);
    }
  }, [backendBase]);

  // Optional convenience: login route that expects backend to set cookies and return user
  const loginWithCredentials = useCallback(
    async (body: { email: string; password: string }) => {
      try {
        const loginUrl = backendBase ? `${backendBase}/api/auth/login` : "/api/auth/login";
        const res = await fetch(loginUrl, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) return false;
        const data = await safeJson(res);
        setUser(data?.user ?? data ?? null);
        return true;
      } catch (err) {
        console.error("login error:", err);
        return false;
      }
    },
    [backendBase]
  );

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      fetchWithAuth,
      refreshTokens,
      logout,
      loginWithCredentials,
    }),
    [user, setUser, loading, fetchWithAuth, refreshTokens, logout, loginWithCredentials]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
