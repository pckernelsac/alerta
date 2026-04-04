import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  DenunciaRequestError,
  geolocationErrorMessage,
  getCurrentPosition,
  postDenuncia,
  uploadFoto,
} from "../api/denuncia.ts";
import { useAuth } from "../context/AuthContext.tsx";
import { useDenuncias } from "../context/DenunciasContext.tsx";

type UiStatus = "idle" | "loading" | "success" | "error";

const TIPOS = [
  { value: "emergencia", label: "Emergencia" },
  { value: "seguridad", label: "Seguridad" },
  { value: "otro", label: "Otro" },
] as const;

export function HomePage() {
  const { addDenuncia } = useDenuncias();
  const { signOut, user, isAdmin } = useAuth();
  const [tipo, setTipo] = useState<string>(TIPOS[0].value);
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<UiStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const resetFeedback = useCallback(() => {
    setMessage(null);
    if (status === "success" || status === "error") setStatus("idle");
  }, [status]);

  const handleFoto = useCallback((file: File | null) => {
    setFoto(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }, [previewUrl]);

  const enviar = useCallback(async () => {
    const desc = descripcion.trim();
    if (!desc) {
      setStatus("error");
      setMessage("Escribe una breve descripción.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const pos = await getCurrentPosition();
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      let foto_url: string | null = null;
      if (foto) {
        setMessage("Subiendo foto...");
        foto_url = await uploadFoto(foto);
      }

      setMessage("Enviando denuncia...");
      const data = await postDenuncia({
        tipo,
        descripcion: desc,
        lat,
        lon,
        foto_url,
      });

      addDenuncia({ tipo, descripcion: desc, lat, lon, foto_url });
      setStatus("success");
      setMessage(`${data.mensaje} — Ver en el mapa.`);
      setDescripcion("");
      setFoto(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setStatus("error");
      if (e instanceof DenunciaRequestError) {
        setMessage(e.message);
      } else if (e instanceof GeolocationPositionError) {
        setMessage(geolocationErrorMessage(e));
      } else if (e instanceof Error) {
        setMessage(e.message);
      } else {
        setMessage("Ha ocurrido un error inesperado.");
      }
    }
  }, [addDenuncia, descripcion, tipo, foto, previewUrl]);

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
      <div className="w-full max-w-md space-y-5">
        {/* Header con usuario */}
        <div className="flex items-center justify-between">
          <p className="truncate text-sm text-slate-400">{user?.email}</p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-sm text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="space-y-2">
          <label htmlFor="tipo" className="block text-sm font-medium text-slate-300">
            Tipo
          </label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => {
              resetFeedback();
              setTipo(e.target.value);
            }}
            disabled={status === "loading"}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
          >
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="descripcion" className="block text-sm font-medium text-slate-300">
            Descripción
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => {
              resetFeedback();
              setDescripcion(e.target.value);
            }}
            disabled={status === "loading"}
            rows={3}
            placeholder="Describe lo ocurrido..."
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
          />
        </div>

        {/* Input de foto */}
        <div className="space-y-2">
          <label htmlFor="foto" className="block text-sm font-medium text-slate-300">
            Foto (opcional)
          </label>
          <input
            ref={fileRef}
            id="foto"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFoto(e.target.files?.[0] ?? null)}
            disabled={status === "loading"}
            className="w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-700 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-200 hover:file:bg-slate-600 disabled:opacity-50"
          />
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Vista previa"
              className="mt-2 max-h-48 w-full rounded-xl border border-slate-700 object-cover"
            />
          )}
        </div>

        {status === "loading" && (
          <p
            className="rounded-xl border border-slate-600 bg-slate-900/80 px-4 py-3 text-center text-sm text-slate-300"
            role="status"
            aria-live="polite"
          >
            {message || "Obteniendo ubicación y enviando..."}
          </p>
        )}

        {status === "success" && message && (
          <p
            className="rounded-xl border border-emerald-700/60 bg-emerald-950/50 px-4 py-3 text-center text-sm text-emerald-200"
            role="status"
            aria-live="polite"
          >
            {message}
          </p>
        )}

        {status === "error" && message && (
          <p
            className="rounded-xl border border-red-800/60 bg-red-950/40 px-4 py-3 text-center text-sm text-red-200"
            role="alert"
            aria-live="assertive"
          >
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={() => void enviar()}
          disabled={status === "loading"}
          className="w-full rounded-2xl bg-red-600 px-6 py-6 text-center text-xl font-semibold tracking-wide text-white shadow-lg shadow-red-900/40 transition hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:py-8 sm:text-2xl"
        >
          {status === "loading" ? "Enviando..." : "ENVIAR ALERTA"}
        </button>

        <div className="flex justify-center gap-4">
          <Link
            to="/dashboard"
            className="text-sm text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline"
          >
            Ver dashboard
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm text-red-400 underline-offset-2 hover:text-red-300 hover:underline"
            >
              Panel admin
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
