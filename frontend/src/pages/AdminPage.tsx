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
  { value: "en_revision", label: "En revision" },
  { value: "resuelta", label: "Resuelta" },
] as const;

const TIPOS = [
  { value: "", label: "Todos" },
  { value: "emergencia", label: "Emergencia" },
  { value: "seguridad", label: "Seguridad" },
  { value: "otro", label: "Otro" },
] as const;

const ESTADO_BADGE: Record<string, string> = {
  pendiente: "border-amber-300 bg-amber-50 text-amber-700",
  en_revision: "border-blue-300 bg-blue-50 text-blue-700",
  resuelta: "border-emerald-300 bg-emerald-50 text-emerald-700",
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
    <div className="flex min-h-0 flex-1 flex-col bg-slate-50 lg:flex-row">
      {/* Panel lateral */}
      <aside className="flex max-h-[55vh] w-full shrink-0 flex-col border-b border-slate-200 bg-white lg:max-h-none lg:h-full lg:w-[420px] lg:border-b-0 lg:border-r">
        {/* Header */}
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-800">Panel Admin</h1>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-lg px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              Salir
            </button>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email}</p>

          {/* Stats */}
          {stats && (
            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                <p className="text-lg font-bold text-slate-800">{stats.total}</p>
                <p className="text-slate-500">Total</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-2">
                <p className="text-lg font-bold text-amber-700">{stats.pendientes}</p>
                <p className="text-amber-600">Pend.</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-2">
                <p className="text-lg font-bold text-blue-700">{stats.en_revision}</p>
                <p className="text-blue-600">Rev.</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2">
                <p className="text-lg font-bold text-emerald-700">{stats.resueltas}</p>
                <p className="text-emerald-600">Resuel.</p>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="mt-3 flex gap-2">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs text-slate-700"
            >
              {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs text-slate-700"
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <Link
            to="/"
            className="mt-3 inline-block text-sm font-medium text-emerald-600 underline-offset-2 hover:text-emerald-700 hover:underline"
          >
            ← Ir al inicio
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Lista de denuncias */}
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {loading && denuncias.length === 0 ? (
            <li className="p-4 text-center text-sm text-slate-500">Cargando...</li>
          ) : denuncias.length === 0 ? (
            <li className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
              No hay denuncias con los filtros seleccionados.
            </li>
          ) : (
            denuncias.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(d.id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    selectedId === d.id
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
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                    <span>{d.user_email ?? "sin usuario"}</span>
                    <span>{formatTimestamp(d.timestamp)}</span>
                  </div>

                  {/* Selector de estado */}
                  <select
                    value={d.estado}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => void cambiarEstado(d.id, e.target.value)}
                    disabled={updatingId === d.id}
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-700 disabled:opacity-50"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_revision">En revision</option>
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
