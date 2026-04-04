import { useCallback, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";

export function RegisterPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);

      if (password !== confirm) {
        setError("Las contraseñas no coinciden.");
        return;
      }

      setLoading(true);
      const err = await signUp(email, password);
      setLoading(false);

      if (err) {
        setError(err);
      } else {
        setSuccess(true);
      }
    },
    [email, password, confirm, signUp],
  );

  if (success) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
        <div className="w-full max-w-sm space-y-5 text-center">
          <h1 className="text-2xl font-bold">Registro exitoso</h1>
          <p className="text-slate-400">
            Revisa tu correo electrónico para confirmar tu cuenta.
          </p>
          <Link
            to="/login"
            className="inline-block rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white shadow-lg shadow-red-900/40 transition hover:bg-red-500"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="w-full max-w-sm space-y-5"
      >
        <h1 className="text-center text-2xl font-bold">Crear cuenta</h1>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm text-slate-300">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm text-slate-300">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirm" className="block text-sm text-slate-300">
            Confirmar contraseña
          </label>
          <input
            id="confirm"
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-red-800/60 bg-red-950/40 px-4 py-3 text-center text-sm text-red-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-red-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-red-900/40 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>

        <p className="text-center text-sm text-slate-400">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="text-red-400 underline-offset-2 hover:text-red-300 hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
