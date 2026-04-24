import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  apiLogin,
  apiRegister,
  clearAuth,
  getStoredToken,
  getStoredUser,
  type AuthUserData,
} from "../api/auth.ts";

type AuthContextValue = {
  user: AuthUserData | null;
  token: string | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserData | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const isAdmin = user?.role === "admin";
  const loading = false; // Auth is synchronous from localStorage

  const signUp = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { user: u, error } = await apiRegister(email, password);
      if (error) return error;
      setUser(u);
      setToken(getStoredToken());
      return null;
    },
    [],
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { user: u, error } = await apiLogin(email, password);
      if (error) return error;
      setUser(u);
      setToken(getStoredToken());
      return null;
    },
    [],
  );

  const signOut = useCallback(() => {
    clearAuth();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, isAdmin, loading, signUp, signIn, signOut }),
    [user, token, isAdmin, loading, signUp, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
