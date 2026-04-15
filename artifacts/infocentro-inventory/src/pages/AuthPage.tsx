import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

type Mode = "login" | "register";

function IconPerson({ focused }: { focused: boolean }) {
  return (
    <span className={`input-icon ${focused ? "input-icon--focused" : ""}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </span>
  );
}

function IconMail({ focused }: { focused: boolean }) {
  return (
    <span className={`input-icon ${focused ? "input-icon--focused" : ""}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    </span>
  );
}

function IconLock({ focused }: { focused: boolean }) {
  return (
    <span className={`input-icon ${focused ? "input-icon--focused" : ""}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    </span>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [animating, setAnimating] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [, navigate] = useLocation();

  const switchMode = (next: Mode) => {
    if (next === mode || animating) return;
    setAnimating(true);
    setError("");
    setSuccess("");
    setFocusedField(null);
    setTimeout(() => {
      setMode(next);
      setAnimating(false);
    }, 350);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        setError(translateError(error));
      } else {
        navigate("/dashboard");
      }
    } else {
      if (!fullName.trim()) {
        setError("Por favor ingresa tu nombre completo.");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setError(translateError(error));
      } else {
        setSuccess("Registro exitoso. Revisa tu correo para confirmar tu cuenta, luego inicia sesión.");
        switchMode("login");
      }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    const { error } = await signInWithGoogle();
    if (error) setError(translateError(error));
  };

  const translateError = (err: string) => {
    if (err.includes("Invalid login credentials")) return "Correo o contraseña incorrectos.";
    if (err.includes("Email not confirmed")) return "Debes confirmar tu correo antes de iniciar sesión.";
    if (err.includes("already registered")) return "Este correo ya está registrado.";
    if (err.includes("Password should be")) return "La contraseña debe tener al menos 6 caracteres.";
    if (err.includes("provider is not enabled")) return "El inicio de sesión con Google no está habilitado en Supabase aún.";
    return err;
  };

  return (
    <div className="auth-page">
      <div className="auth-background" />
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="#0f2d6e" />
              <path d="M12 20h16M12 14h10M12 26h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="30" cy="14" r="3" fill="#4a90d9" />
            </svg>
          </div>
          <h1 className="auth-brand">InfoInventario</h1>
          <p className="auth-subtitle">Sistema de Control de Activos — Infocentro</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => switchMode("login")}
            type="button"
          >
            Iniciar Sesión
          </button>
          <button
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => switchMode("register")}
            type="button"
          >
            Registrarse
          </button>
          <div className={`auth-tab-indicator ${mode === "register" ? "right" : ""}`} />
        </div>

        <div className={`auth-card ${animating ? "animating" : ""}`}>
          {success && <div className="auth-success">{success}</div>}
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "register" && (
              <div className="form-group">
                <label htmlFor="fullName">Nombre Completo</label>
                <div className="input-wrapper">
                  <IconPerson focused={focusedField === "fullName"} />
                  <input
                    id="fullName"
                    type="text"
                    className="input-with-icon"
                    placeholder="Ej. María González"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    onFocus={() => setFocusedField("fullName")}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <div className="input-wrapper">
                <IconMail focused={focusedField === "email"} />
                <input
                  id="email"
                  type="email"
                  className="input-with-icon"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrapper">
                <IconLock focused={focusedField === "password"} />
                <input
                  id="password"
                  type="password"
                  className="input-with-icon"
                  placeholder={mode === "register" ? "Mínimo 6 caracteres" : "Tu contraseña"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  {mode === "login" ? "Ingresando..." : "Registrando..."}
                </span>
              ) : (
                mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>o continúa con</span>
          </div>

          <button type="button" className="btn-google" onClick={handleGoogle}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          <p className="auth-switch-text">
            {mode === "login" ? (
              <>¿No tienes cuenta? <button type="button" onClick={() => switchMode("register")}>Regístrate aquí</button></>
            ) : (
              <>¿Ya tienes cuenta? <button type="button" onClick={() => switchMode("login")}>Inicia sesión</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
