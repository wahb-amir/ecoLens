// providers/AuthProvider.tsx
"use client";

import React, { createContext, useContext, useState } from "react";

type User = {
  id?: string;
  email?: string;
  role?: string;
} | null;

type AuthContextType = {
  user: User;
  setUser: (u: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: User;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User>(initialUser ?? null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
