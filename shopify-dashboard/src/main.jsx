import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { initSupabase } from "./integrations/supabase/client";

const renderApp = async () => {
  try {
    // 1. Fetch Config
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL}/api/config`,
    );
    if (!response.ok) throw new Error("Failed to load app configuration");

    const config = await response.json();

    // 2. Init Supabase
    if (config.supabase && config.supabase.url && config.supabase.anonKey) {
      initSupabase(config.supabase.url, config.supabase.anonKey);
    } else {
      console.warn("Supabase config missing from backend");
    }

    // 3. Render
    createRoot(document.getElementById("root")).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (err) {
    console.error("App Config Error (Non-Fatal):", err);
    // Continue rendering even if config fails - useAuth will handle the fallback
    createRoot(document.getElementById("root")).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
};

renderApp();
