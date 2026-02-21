"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to parse JSON safely
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser?: User;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User>(initialUser ?? null);
  const [loading, setLoading] = useState<boolean>(initialUser == null);

  const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(
    /\/$/,
    "",
  );

  // Single refresh mutex to deduplicate concurrent refresh calls
  const refreshMutex = useRef<Promise<boolean> | null>(null);

  // Refresh tokens helper
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    if (refreshMutex.current) return refreshMutex.current;

    const p = (async () => {
      try {
        const url = backendBase
          ? `${backendBase}/api/user/me`
          : "/api/user/me";

        const res = await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          // After refresh, sync the user
          await syncUser();
          return true;
        }

        return false;
      } catch (err) {
        console.error("refreshTokens error:", err);
        return false;
      } finally {
        refreshMutex.current = null;
      }
    })();

    refreshMutex.current = p;
    return p;
  }, [backendBase]);

  // Fetch wrapper that retries once on 401
  const fetchWithAuth: FetchWithAuth = useCallback(
    async (input, init = {}) => {
      const opts: RequestInit = {
        credentials: "include",
        ...init,
      };

      const doFetch = async () => fetch(input, opts);

      let res = await doFetch();
      if (res.status !== 401) return res;

      // Attempt refresh
      const refreshed = await refreshTokens();
      if (!refreshed) return res;

      // Retry original request once
      return await doFetch();
    },
    [refreshTokens],
  );

  // Fetch current user (safe to call multiple times)
  const syncUser = useCallback(async (): Promise<void> => {
    try {
      const url = backendBase ? `${backendBase}/api/user/me` : "/api/user/me";

      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await safeJson(res);
        setUser(data?.user ?? data ?? null);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("syncUser failed:", err);
      setUser(null);
    }
  }, [backendBase]);

  // On mount, fetch user if no initialUser
  useEffect(() => {
    let mounted = true;

    if (initialUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    (async () => {
      const url = backendBase ? `${backendBase}/api/user/me` : "/api/user/me";
      try {
        let res = await fetch(url, {
          method: "GET",
          credentials: "include",
        });

        // If unauthorized, try refresh once
        if (res.status === 401) {
          const ok = await refreshTokens();
          if (ok)
            res = await fetch(url, { method: "GET", credentials: "include" });
        }

        if (!mounted) return;

        if (res.ok) {
          const data = await safeJson(res);
          setUser(data?.user ?? data ?? null);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("AuthProvider initial fetch failed:", err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [backendBase, initialUser, refreshTokens]);

  // Logout helper
  const logout = useCallback(async () => {
    try {
      const url = backendBase
        ? `${backendBase}/api/auth/logout`
        : "/api/auth/logout";
      await fetch(url, {
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

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      fetchWithAuth,
      refreshTokens,
      logout,
      syncUser,
    }),
    [user, setUser, loading, fetchWithAuth, refreshTokens, logout, syncUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
