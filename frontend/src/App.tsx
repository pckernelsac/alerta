import { Route, Routes } from "react-router-dom";
import { AdminRoute } from "./components/AdminRoute.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import { RootLayout } from "./layouts/RootLayout.tsx";
import { AdminPage } from "./pages/AdminPage.tsx";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { RegisterPage } from "./pages/RegisterPage.tsx";

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        {/* Protegidas — usuario autenticado */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Protegidas — solo admin */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
