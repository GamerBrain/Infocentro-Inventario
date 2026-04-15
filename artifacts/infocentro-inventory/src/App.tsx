import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import { supabaseMisconfigured } from "@/lib/supabase";
import { useEffect } from "react";
import { useLocation } from "wouter";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [user, loading]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f8" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner large" style={{ margin: "0 auto" }} />
          <p style={{ color: "#4a5568", marginTop: "1rem" }}>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  return <Component />;
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f8" }}>
        <div className="spinner large" style={{ margin: "0 auto" }} />
      </div>
    );
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <PublicRoute component={AuthPage} />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function MisconfiguredScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f8", padding: "2rem" }}>
      <div style={{ background: "white", borderRadius: "12px", padding: "2.5rem", maxWidth: "480px", width: "100%", boxShadow: "0 8px 40px rgba(15,45,110,0.15)", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚙️</div>
        <h1 style={{ color: "#0f2d6e", fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.75rem" }}>Configuración requerida</h1>
        <p style={{ color: "#4a5568", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          Las variables de entorno de Supabase no están configuradas. Para que la app funcione, agrega estas variables en tu plataforma de hosting:
        </p>
        <div style={{ background: "#f0f4f8", borderRadius: "8px", padding: "1rem", textAlign: "left", fontFamily: "monospace", fontSize: "0.85rem", color: "#1a202c", marginBottom: "1rem" }}>
          <div style={{ marginBottom: "0.4rem" }}>VITE_SUPABASE_URL=tu_url_de_supabase</div>
          <div>VITE_SUPABASE_ANON_KEY=tu_clave_anon</div>
        </div>
        <p style={{ color: "#718096", fontSize: "0.8rem" }}>
          Las encuentras en tu proyecto de Supabase → Settings → API
        </p>
      </div>
    </div>
  );
}

function App() {
  if (supabaseMisconfigured) {
    return <MisconfiguredScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
