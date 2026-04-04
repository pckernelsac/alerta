import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DenunciaInput, DenunciaMapa } from "../types/denuncia.ts";

type DenunciasContextValue = {
  denuncias: DenunciaMapa[];
  addDenuncia: (input: DenunciaInput) => void;
  clearDenuncias: () => void;
};

const DenunciasContext = createContext<DenunciasContextValue | null>(null);

export function DenunciasProvider({ children }: { children: ReactNode }) {
  const [denuncias, setDenuncias] = useState<DenunciaMapa[]>([]);

  const addDenuncia = useCallback((input: DenunciaInput) => {
    const item: DenunciaMapa = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      ...input,
    };
    setDenuncias((prev) => [...prev, item]);
  }, []);

  const clearDenuncias = useCallback(() => {
    setDenuncias([]);
  }, []);

  const value = useMemo(
    () => ({ denuncias, addDenuncia, clearDenuncias }),
    [denuncias, addDenuncia, clearDenuncias],
  );

  return (
    <DenunciasContext.Provider value={value}>
      {children}
    </DenunciasContext.Provider>
  );
}

export function useDenuncias(): DenunciasContextValue {
  const ctx = useContext(DenunciasContext);
  if (!ctx) {
    throw new Error("useDenuncias debe usarse dentro de DenunciasProvider");
  }
  return ctx;
}
