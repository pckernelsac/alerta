import { useCallback, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);
      const err = await signIn(email, password);
      setLoading(false);
      if (err) {
        setError(err);
      } else {
        navigate("/", { replace: true });
      }
    },
    [email, password, signIn, navigate],
  );

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="w-full max-w-sm space-y-5"
      >
        <h1 className="text-center text-2xl font-bold">Iniciar sesión</h1>

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
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <p className="text-center text-sm text-slate-400">
          ¿No tienes cuenta?{" "}
          <Link
            to="/registro"
            className="text-red-400 underline-offset-2 hover:text-red-300 hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  );
}
