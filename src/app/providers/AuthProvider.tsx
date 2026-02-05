"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";

type User = {
  id?: string;
  email?: string;
  role?: string;
} | null;

type FetchWithAuth = (
  input: RequestInfo,
  init?: RequestInit,
) => Promise<Response>;

type AuthContextType = {
  user: User;
  setUser: (u: User) => void;
  loading: boolean;
  fetchWithAuth: FetchWithAuth;
  refreshTokens: () => Promise<boolean>;
  logout: () => Promise<void>;
  syncUser: () => Promise<void>;
  loginWithCredentials?: (body: {
    email: string;
    password: string;
  }) => Promise<boolean>;
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
 * AuthProvider
 *
 * - Fetches /api/user/me on mount (client-side) if no initialUser.
 * - fetchWithAuth wraps fetch and retries once after a successful refresh.
 * - refreshTokens uses a single shared in-flight promise to dedupe refresh requests.
 *
 * IMPORTANT:
 * - Backend must set cookies (Set-Cookie) on refresh/login endpoints.
 * - Ensure SameSite/Secure are set appropriately for cross-site usage (SameSite=None; Secure).
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

  const backendBase =
    (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "") || "";

  // refreshMutex holds the in-flight refresh promise (if any) so concurrent callers wait for the same refresh.
  const refreshMutex = useRef<Promise<boolean> | null>(null);

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    // If a refresh is already in progress, return that promise.
    if (refreshMutex.current) return refreshMutex.current;

    const p = (async () => {
      try {
        const refreshUrl = backendBase
          ? `${backendBase}/api/auth/refresh`
          : "/api/auth/refresh";

        const res = await fetch(refreshUrl, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        return res.ok;
      } catch (err) {
        console.error("refreshTokens error:", err);
        return false;
      } finally {
        // allow next refresh attempts
        refreshMutex.current = null;
      }
    })();

    // store promise so others can await it
    refreshMutex.current = p;
    return p;
  }, [backendBase]);

  // wrapper fetch which retries once after performing token refresh on 401
  const fetchWithAuth: FetchWithAuth = useCallback(
    async (input, init = {}) => {
      // default to include creds always
      const opts: RequestInit = {
        credentials: "include",
        ...init,
      };

      // We use a helper to re-run the same request.
      // WARNING: if init.body is a stream (FormData from a consumed source), retry won't work.
      const doFetch = async () => fetch(input, opts);

      let res = await doFetch();
      if (res.status !== 401) return res;

      // got 401 -> attempt a single refresh (deduped by mutex)
      const refreshed = await refreshTokens();
      if (!refreshed) {
        // couldn't refresh -> return original 401
        return res;
      }

      // refresh succeeded -> retry original request once
      // (Note: if body is a stream it may be unusable on retry; avoid streaming bodies for auth calls)
      res = await doFetch();
      return res;
    },
    [refreshTokens],
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
        const meUrl = backendBase
          ? `${backendBase}/api/user/me`
          : "/api/user/me";
        let res = await fetch(meUrl, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (res.status === 401) {
          // try refresh once (deduped)
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

  // logout helper: backend should clear cookies on logout
  const logout = useCallback(async () => {
    try {
      const logoutUrl = backendBase
        ? `${backendBase}/api/auth/logout`
        : "/api/auth/logout";
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

 const syncUser = useCallback(async (): Promise<void> => {
  try {
    const meUrl = backendBase ? `${backendBase}/api/user/me` : "/api/user/me";
    const res = await fetch(meUrl, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const data = await safeJson(res);
      // normalize so {} becomes null
      const normalizedUser =
        data?.user && Object.keys(data.user).length > 0
          ? data.user
          : Object.keys(data || {}).length > 0
          ? data
          : null;

      setUser(normalizedUser);
    } else {
      setUser(null);
    }
  } catch (err) {
    console.error("syncUser failed:", err);
    setUser(null);
  }
}, [backendBase]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      fetchWithAuth,
      refreshTokens,
      logout,
      syncUser
    
    }),
    [
      user,
      setUser,
      loading,
      fetchWithAuth,
      refreshTokens,
      logout,
      syncUser
    ],
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
