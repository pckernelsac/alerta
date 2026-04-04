import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchAdminStats,
  fetchDenunciasAdmin,
  updateEstado,
  type AdminStats,
  type DenunciaAdmin,
} from "../api/admin.ts";
import { useAuth } from "../context/AuthContext.tsx";
import { AdminMap } from "../components/admin/AdminMap.tsx";

const ESTADOS = [
  { value: "", label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en_revision", label: "En revisión" },
  { value: "resuelta", label: "Resuelta" },
] as const;

const TIPOS = [
  { value: "", label: "Todos" },
  { value: "emergencia", label: "Emergencia" },
  { value: "seguridad", label: "Seguridad" },
  { value: "otro", label: "Otro" },
] as const;

const ESTADO_COLORS: Record<string, string> = {
  pendiente: "border-amber-600/60 bg-amber-950/40 text-amber-200",
  en_revision: "border-blue-600/60 bg-blue-950/40 text-blue-200",
  resuelta: "border-emerald-600/60 bg-emerald-950/40 text-emerald-200",
};

function formatTimestamp(ts: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(ts));
}

export function AdminPage() {
  const { signOut, user } = useAuth();
  const [denuncias, setDenuncias] = useState<DenunciaAdmin[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filtros: { estado?: string; tipo?: string } = {};
      if (filtroEstado) filtros.estado = filtroEstado;
      if (filtroTipo) filtros.tipo = filtroTipo;

      const [data, statsData] = await Promise.all([
        fetchDenunciasAdmin(filtros),
        fetchAdminStats(),
      ]);
      setDenuncias(data);
      setStats(statsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar.");
    } finally {
      setLoading(false);
    }
  }, [filtroEstado, filtroTipo]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const cambiarEstado = useCallback(
    async (id: string, nuevoEstado: string) => {
      setUpdatingId(id);
      try {
        await updateEstado(id, nuevoEstado);
        setDenuncias((prev) =>
          prev.map((d) => (d.id === id ? { ...d, estado: nuevoEstado } : d)),
        );
        // Recargar stats
        fetchAdminStats().then(setStats).catch(() => {});
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al actualizar.");
      } finally {
        setUpdatingId(null);
      }
    },
    [],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-950 lg:flex-row">
      {/* Panel lateral */}
      <aside className="flex max-h-[55vh] w-full shrink-0 flex-col border-b border-slate-800 bg-slate-900 lg:max-h-none lg:h-full lg:w-[420px] lg:border-b-0 lg:border-r">
        {/* Header */}
        <div className="border-b border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-100">Panel Admin</h1>
            <button
              type="button"
              onClick={() => void signOut()}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Salir
            </button>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email}</p>

          {/* Stats */}
          {stats && (
            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-2">
                <p className="text-lg font-bold text-slate-100">{stats.total}</p>
                <p className="text-slate-400">Total</p>
              </div>
              <div className="rounded-lg border border-amber-800/40 bg-amber-950/30 p-2">
                <p className="text-lg font-bold text-amber-200">{stats.pendientes}</p>
                <p className="text-amber-400/70">Pend.</p>
              </div>
              <div className="rounded-lg border border-blue-800/40 bg-blue-950/30 p-2">
                <p className="text-lg font-bold text-blue-200">{stats.en_revision}</p>
                <p className="text-blue-400/70">Rev.</p>
              </div>
              <div className="rounded-lg border border-emerald-800/40 bg-emerald-950/30 p-2">
                <p className="text-lg font-bold text-emerald-200">{stats.resueltas}</p>
                <p className="text-emerald-400/70">Resuel.</p>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="mt-3 flex gap-2">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-slate-200"
            >
              {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-slate-200"
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <Link
            to="/"
            className="mt-3 inline-block text-sm text-red-400 underline-offset-2 hover:text-red-300 hover:underline"
          >
            ← Ir al inicio
          </Link>
        </div>

        {/* Lista de denuncias */}
        {error && (
          <div className="border-b border-red-800/40 bg-red-950/30 px-4 py-2 text-xs text-red-300">
            {error}
          </div>
        )}

        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {loading && denuncias.length === 0 ? (
            <li className="p-4 text-center text-sm text-slate-500">Cargando...</li>
          ) : denuncias.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-700 p-4 text-center text-sm text-slate-500">
              No hay denuncias con los filtros seleccionados.
            </li>
          ) : (
            denuncias.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(d.id)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                    selectedId === d.id
                      ? "border-red-500/60 bg-red-950/30 text-slate-100"
                      : "border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium capitalize text-slate-100">
                      {d.tipo}
                    </span>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${ESTADO_COLORS[d.estado] ?? ""}`}
                    >
                      {d.estado.replace("_", " ")}
                    </span>
                  </div>
                  <span className="mt-0.5 block line-clamp-2 text-slate-400">
                    {d.descripcion}
                  </span>
                  {d.foto_url && (
                    <img
                      src={d.foto_url}
                      alt=""
                      className="mt-1.5 max-h-24 w-full rounded border border-slate-700 object-cover"
                    />
                  )}
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                    <span>{d.user_email ?? "sin usuario"}</span>
                    <span>{formatTimestamp(d.timestamp)}</span>
                  </div>

                  {/* Selector de estado */}
                  <select
                    value={d.estado}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => void cambiarEstado(d.id, e.target.value)}
                    disabled={updatingId === d.id}
                    className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-200 disabled:opacity-50"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_revision">En revisión</option>
                    <option value="resuelta">Resuelta</option>
                  </select>
                </button>
              </li>
            ))
          )}
        </ul>
      </aside>

      {/* Mapa */}
      <div className="relative min-h-0 min-w-0 flex-1 basis-0">
        <AdminMap denuncias={denuncias} selectedId={selectedId} />
      </div>
    </div>
  );
}
