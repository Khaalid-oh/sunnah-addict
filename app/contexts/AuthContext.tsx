"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type SessionCustomer = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

type AuthContextValue = {
  customer: SessionCustomer | null;
  loading: boolean;
  refetch: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<SessionCustomer | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = (await res.json()) as { customer?: SessionCustomer | null };
      setCustomer(data.customer ?? null);
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <AuthContext.Provider value={{ customer, loading, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
