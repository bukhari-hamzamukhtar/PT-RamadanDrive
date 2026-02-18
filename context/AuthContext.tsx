"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "pt_ration_unlocked";

type AuthContextType = {
  isUnlocked: boolean;
  unlock: (code: string) => boolean;
  lock: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    setIsUnlocked(stored === "true");
    setMounted(true);
  }, []);

  const unlock = (code: string): boolean => {
    const expected = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";
    if (code === expected) {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, "true");
      }
      setIsUnlocked(true);
      return true;
    }
    return false;
  };

  const lock = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsUnlocked(false);
  };

  const value: AuthContextType = { isUnlocked, unlock, lock };

  if (!mounted) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
