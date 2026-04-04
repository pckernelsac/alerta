import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { DenunciasProvider } from "./context/DenunciasContext.tsx";
import "./index.css";
import "./lib/leafletIcon.ts";

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DenunciasProvider>
          <App />
        </DenunciasProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
