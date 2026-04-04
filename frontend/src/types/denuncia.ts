/** Denuncia mostrada en el mapa / contexto de sesión. */
export type DenunciaMapa = {
  id: string;
  tipo: string;
  descripcion: string;
  lat: number;
  lon: number;
  foto_url: string | null;
  createdAt: number;
};

/** Datos para registrar una denuncia (sin id ni marca temporal). */
export type DenunciaInput = Omit<DenunciaMapa, "id" | "createdAt">;
