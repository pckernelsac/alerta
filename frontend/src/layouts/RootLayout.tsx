import { Outlet } from "react-router-dom";

/** Contenedor de altura completa para todas las rutas. */
export function RootLayout() {
  return (
    <div className="flex min-h-full flex-col">
      <Outlet />
    </div>
  );
}
