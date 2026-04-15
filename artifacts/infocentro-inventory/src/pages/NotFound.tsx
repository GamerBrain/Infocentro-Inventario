import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f0f4f8" }}>
      <h1 style={{ fontSize: "4rem", color: "#0f2d6e", margin: 0 }}>404</h1>
      <p style={{ color: "#4a5568", marginTop: "1rem" }}>Página no encontrada</p>
      <button onClick={() => navigate("/")} style={{ marginTop: "1.5rem", padding: "0.75rem 2rem", background: "#0f2d6e", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
        Volver al inicio
      </button>
    </div>
  );
}
