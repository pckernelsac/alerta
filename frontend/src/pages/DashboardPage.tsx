import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMisDenuncias, type DenunciaFromApi } from "../api/denuncia.ts";
import { DashboardMap } from "../components/dashboard/DashboardMap.tsx";
import { useAuth } from "../context/AuthContext.tsx";

function formatTimestamp(ts: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(ts));
}

const ESTADO_BADGE: Record<string, string> = {
  pendiente: "border-amber-300 bg-amber-50 text-amber-700",
  en_revision: "border-blue-300 bg-blue-50 text-blue-700",
  resuelta: "border-emerald-300 bg-emerald-50 text-emerald-700",
};

export function DashboardPage() {
  const { signOut, user, isAdmin } = useAuth();
  const [denuncias, setDenuncias] = useState<DenunciaFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMisDenuncias();
      setDenuncias(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar denuncias.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const mapItems = denuncias.map((d) => ({
    id: d.id,
    tipo: d.tipo,
    descripcion: d.descripcion,
    lat: d.lat,
    lon: d.lon,
    foto_url: d.foto_url,
    createdAt: new Date(d.timestamp).getTime(),
  }));

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-50 md:flex-row">
      <aside className="flex max-h-[40vh] w-full shrink-0 flex-col border-b border-slate-200 bg-white md:max-h-none md:h-full md:w-80 md:border-b-0 md:border-r">
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-800">Mis denuncias</h1>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-lg px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              Salir
            </button>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email}</p>
          <p className="mt-1 text-xs text-slate-500">
            {loading
              ? "Cargando..."
              : denuncias.length === 0
                ? "Sin denuncias"
                : `${denuncias.length} denuncia${denuncias.length === 1 ? "" : "s"}`}
          </p>
          <div className="mt-3 flex gap-3">
            <Link
              to="/"
              className="text-sm font-medium text-emerald-600 underline-offset-2 hover:text-emerald-700 hover:underline"
            >
              ← Enviar alerta
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm font-medium text-emerald-600 underline-offset-2 hover:text-emerald-700 hover:underline"
              >
                Panel admin
              </Link>
            )}
          </div>
        </div>

        {error && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {!loading && denuncias.length === 0 ? (
            <li className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
              Aun no has enviado denuncias. Envia una desde el inicio.
            </li>
          ) : (
            denuncias.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => setFocusId(d.id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    focusId === d.id
                      ? "border-emerald-400 bg-emerald-50 text-slate-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold capitalize text-slate-800">{d.tipo}</span>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${ESTADO_BADGE[d.estado] ?? ""}`}
                    >
                      {d.estado.replace("_", " ")}
                    </span>
                  </div>
                  <span className="mt-0.5 block line-clamp-2 text-slate-500">{d.descripcion}</span>
                  {d.foto_url && (
                    <img
                      src={d.foto_url}
                      alt=""
                      className="mt-1.5 max-h-24 w-full rounded-lg border border-slate-200 object-cover"
                    />
                  )}
                  <span className="mt-1 block text-xs text-slate-400">
                    {d.lat.toFixed(4)}, {d.lon.toFixed(4)} · {formatTimestamp(d.timestamp)}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </aside>

      <div className="relative min-h-0 min-w-0 flex-1 basis-0">
        <DashboardMap denuncias={mapItems} focusId={focusId} />
      </div>
    </div>
  );
}
