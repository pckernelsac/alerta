import { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardMap } from "../components/dashboard/DashboardMap.tsx";
import { useAuth } from "../context/AuthContext.tsx";
import { useDenuncias } from "../context/DenunciasContext.tsx";
import { formatDateTime } from "../lib/formatDate.ts";

export function DashboardPage() {
  const { denuncias } = useDenuncias();
  const { signOut, user } = useAuth();
  const [focusId, setFocusId] = useState<string | null>(null);

  const ordered = [...denuncias].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-950 md:flex-row">
      <aside className="flex max-h-[40vh] w-full shrink-0 flex-col border-b border-slate-800 bg-slate-900 md:max-h-none md:h-full md:w-80 md:border-b-0 md:border-r">
        <div className="border-b border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-slate-100">Dashboard</h1>
            <button
              type="button"
              onClick={() => void signOut()}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Salir
            </button>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email}</p>
          <p className="mt-1 text-xs text-slate-500">
            {denuncias.length === 0
              ? "Sin denuncias en sesión"
              : `${denuncias.length} denuncia${denuncias.length === 1 ? "" : "s"}`}
          </p>
          <Link
            to="/"
            className="mt-3 inline-block text-sm text-red-400 underline-offset-2 hover:text-red-300 hover:underline"
          >
            ← Enviar alerta
          </Link>
        </div>
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {ordered.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-700 p-4 text-center text-sm text-slate-500">
              Envía una denuncia desde inicio para ver el marcador aquí. Los datos viven en esta sesión del
              navegador (listo para enlazar con el backend).
            </li>
          ) : (
            ordered.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => setFocusId(d.id)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                    focusId === d.id
                      ? "border-red-500/60 bg-red-950/30 text-slate-100"
                      : "border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <span className="font-medium capitalize text-slate-100">{d.tipo}</span>
                  <span className="mt-0.5 block line-clamp-2 text-slate-400">{d.descripcion}</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {d.lat.toFixed(4)}, {d.lon.toFixed(4)} · {formatDateTime(d.createdAt)}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </aside>

      <div className="relative min-h-0 min-w-0 flex-1 basis-0">
        <DashboardMap denuncias={denuncias} focusId={focusId} />
      </div>
    </div>
  );
}
