import { useCallback, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DenunciaRequestError,
  geolocationErrorMessage,
  getCurrentPosition,
  postDenuncia,
  uploadFoto,
} from "../api/denuncia.ts";
import { useDenuncias } from "../context/DenunciasContext.tsx";

type UiStatus = "idle" | "loading" | "success" | "error";

const TIPO_LABELS: Record<string, string> = {
  contaminacion_ambiental: "Contaminación Ambiental",
  parques_jardines: "Parques y Jardines",
  basura_calles: "Basura en las Calles",
  salud_publica: "Salud Pública",
  construcciones_sin_licencia: "Construcciones sin Licencia",
  contaminacion_visual: "Contaminación Visual",
  locales_sin_licencia: "Locales sin Licencia de Funcionamiento",
  defensa_consumidor: "Defensa del Consumidor",
};

export function ReportPage() {
  const { tipo = "" } = useParams<{ tipo: string }>();
  const navigate = useNavigate();
  const { addDenuncia } = useDenuncias();

  const label = TIPO_LABELS[tipo] ?? tipo;

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

  const handleFoto = useCallback(
    (file: File | null) => {
      setFoto(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(file ? URL.createObjectURL(file) : null);
    },
    [previewUrl],
  );

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
      setMessage(data.mensaje);
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
    <div className="flex flex-1 flex-col items-center bg-gray-50 px-4 py-6">
      <div className="w-full max-w-md space-y-5">
        {/* Back + title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
            aria-label="Volver"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-800">{label}</h1>
        </div>

        {/* Form */}
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-1.5">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
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
              rows={4}
              placeholder="Describe lo ocurrido..."
              className="w-full resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="foto" className="block text-sm font-medium text-gray-700">
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
              className="w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
            />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Vista previa"
                className="mt-2 max-h-48 w-full rounded-xl border border-gray-200 object-cover"
              />
            )}
          </div>
        </div>

        {/* Feedback */}
        {status === "loading" && (
          <p className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-sm text-gray-600" role="status" aria-live="polite">
            {message || "Obteniendo ubicación y enviando..."}
          </p>
        )}

        {status === "success" && message && (
          <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm text-green-700" role="status" aria-live="polite">
            {message}
          </p>
        )}

        {status === "error" && message && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700" role="alert" aria-live="assertive">
            {message}
          </p>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={() => void enviar()}
          disabled={status === "loading"}
          className="w-full rounded-2xl bg-green-600 px-6 py-4 text-center text-lg font-bold tracking-wide text-white shadow-lg shadow-green-200 transition hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-400 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Enviando..." : "ENVIAR DENUNCIA"}
        </button>

        {status === "success" && (
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Volver al inicio
          </button>
        )}
      </div>
    </div>
  );
}
