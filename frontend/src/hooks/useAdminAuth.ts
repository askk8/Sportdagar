"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "sportdagar_admin_token";

export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setToken(stored);
    setLoading(false);
  }, []);

  const saveToken = (t: string) => {
    localStorage.setItem(STORAGE_KEY, t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  };

  return { token, loading, isAdmin: !!token, saveToken, logout };
}
