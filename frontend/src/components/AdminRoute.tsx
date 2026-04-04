import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { checkIsAdmin } from "../api/admin.ts";
import { useAuth } from "../context/AuthContext.tsx";

export function AdminRoute() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    checkIsAdmin().then(setIsAdmin);
  }, [user]);

  if (authLoading || isAdmin === null) {
    return (
      <div className="flex min-h-full items-center justify-center bg-slate-950 text-slate-400">
        Verificando permisos...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}
