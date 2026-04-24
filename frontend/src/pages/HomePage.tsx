import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Tab = "emergencias" | "denuncias";

const EMERGENCIAS = [
  {
    id: "serenazgo",
    label: "SERENAZGO",
    phone: "tel:+51999999999",
    icon: (
      <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3 3V9" />
      </svg>
    ),
  },
  {
    id: "bomberos",
    label: "BOMBEROS",
    phone: "tel:116",
    icon: (
      <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
      </svg>
    ),
  },
  {
    id: "ambulancia",
    label: "AMBULANCIA",
    phone: "tel:106",
    icon: (
      <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h2.25m0 0V9.375c0-.621.504-1.125 1.125-1.125h3.026a2.999 2.999 0 012.287 1.059l1.838 2.169H17.5a1.125 1.125 0 011.125 1.125v1.621M6.75 14.25h10.5" />
      </svg>
    ),
  },
] as const;

const DENUNCIAS = [
  {
    id: "contaminacion_ambiental",
    label: "CONTAMINACIÓN\nAMBIENTAL",
    color: "bg-blue-600",
    icon: (
      <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
    ),
  },
  {
    id: "parques_jardines",
    label: "PARQUES Y\nJARDINES",
    color: "bg-blue-600",
    icon: (
      <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  },
  {
    id: "basura_calles",
    label: "BASURA\nEN LAS CALLES",
    color: "bg-blue-600",
    icon: (
      <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    ),
  },
  {
    id: "salud_publica",
    label: "SALUD\nPÚBLICA",
    color: "bg-blue-600",
    icon: (
      <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "construcciones_sin_licencia",
    label: "CONSTRUCCIONES\nSIN LICENCIA",
    color: "bg-purple-600",
    icon: (
      <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  {
    id: "contaminacion_visual",
    label: "CONTAMINACIÓN\nVISUAL",
    color: "bg-purple-600",
    icon: (
      <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: "locales_sin_licencia",
    label: "LOCALES SIN\nLICENCIA DE\nFUNCIONAMIENTO",
    color: "bg-green-600",
    icon: (
      <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.999 2.999 0 00.97-1.599L5.225 3h13.55l1.256 4.75A2.999 2.999 0 0021 9.35" />
      </svg>
    ),
  },
  {
    id: "defensa_consumidor",
    label: "DEFENSA\nDEL\nCONSUMIDOR",
    color: "bg-green-600",
    icon: (
      <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
      </svg>
    ),
  },
] as const;

export function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("emergencias");
  const navigate = useNavigate();

  const handleDenuncia = (tipo: string) => {
    navigate(`/reportar/${tipo}`);
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setActiveTab("emergencias")}
          className={`flex-1 py-3 text-center text-sm font-semibold transition ${
            activeTab === "emergencias"
              ? "border-b-3 border-green-600 text-green-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Emergencias
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("denuncias")}
          className={`flex-1 py-3 text-center text-sm font-semibold transition ${
            activeTab === "denuncias"
              ? "border-b-3 border-green-600 text-green-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Denuncias
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6">
        {activeTab === "emergencias" ? (
          <div className="mx-auto max-w-sm">
            <h2 className="mb-6 text-center text-xl font-bold text-gray-800">
              Emergencias
            </h2>
            <div className="flex flex-col items-center gap-6">
              {EMERGENCIAS.map((em) => (
                <a
                  key={em.id}
                  href={em.phone}
                  className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-red-600 shadow-lg shadow-red-200 transition hover:scale-105 hover:bg-red-700 active:scale-95"
                >
                  {em.icon}
                  <span className="mt-1 text-center text-xs font-bold tracking-wide text-white">
                    {em.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-sm">
            <h2 className="mb-6 text-center text-xl font-bold text-gray-800">
              Denuncias
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {DENUNCIAS.map((den) => (
                <button
                  key={den.id}
                  type="button"
                  onClick={() => handleDenuncia(den.id)}
                  className={`flex h-32 flex-col items-center justify-center rounded-full ${den.color} shadow-lg transition hover:scale-105 hover:brightness-110 active:scale-95`}
                >
                  {den.icon}
                  <span className="mt-1 whitespace-pre-line text-center text-[10px] font-bold leading-tight tracking-wide text-white">
                    {den.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-3 text-center">
        <p className="text-xs font-medium text-gray-500">
          MUNICIPALIDAD PROVINCIAL DE
        </p>
        <p className="text-sm font-bold tracking-wider text-green-800">
          SATIPO
        </p>
      </footer>
    </div>
  );
}
