import { type FormEvent, type ReactNode, useCallback, useEffect, useState } from "react";

interface AdminGateProps {
  children: ReactNode;
}

type AuthState = "checking" | "login" | "authenticated";

export default function AdminGate({ children }: AdminGateProps) {
  const [state, setState] = useState<AuthState>("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("hz:admin-token");
    if (!token) {
      setState("login");
      return;
    }
    fetch("/api/auth-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setState("authenticated");
        } else {
          sessionStorage.removeItem("hz:admin-token");
          setState("login");
        }
      })
      .catch(() => {
        sessionStorage.removeItem("hz:admin-token");
        setState("login");
      });
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (loading || !password.trim()) return;
      setLoading(true);
      setError("");
      fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
        .then(async (r) => {
          const data = await r.json();
          if (r.ok && data.token) {
            sessionStorage.setItem("hz:admin-token", data.token);
            setState("authenticated");
          } else {
            setError(data.error || "Falsches Passwort");
          }
        })
        .catch(() => setError("Verbindungsfehler"))
        .finally(() => setLoading(false));
    },
    [password, loading],
  );

  if (state === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand">
        <div className="w-5 h-5 border-2 border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (state === "authenticated") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand">
      <form onSubmit={handleSubmit} className="w-full max-w-[320px] px-6">
        <div className="flex flex-col items-center gap-5">
          {/* Logo */}
          <div className="w-10 h-10 rounded bg-[rgba(255,255,255,0.12)] flex items-center justify-center mb-2">
            <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 16V6l6-3 6 3v10" />
              <path d="M4 16h12" />
              <line x1="8" y1="8" x2="8" y2="13" />
              <line x1="12" y1="8" x2="12" y2="13" />
            </svg>
          </div>
          <div className="text-center">
            <span className="text-white font-bold tracking-[0.08em] text-[13px] uppercase opacity-90">Holzschneiderei</span>
            <span className="text-[rgba(255,255,255,0.4)] text-[10px] tracking-[0.08em] uppercase font-bold ml-2">Admin</span>
          </div>

          {/* Password input */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort"
            autoFocus
            className="w-full h-10 px-3 rounded-sm bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-white text-[13px] font-body tracking-[0.04em] placeholder:text-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(255,255,255,0.3)] transition-colors"
          />

          {/* Error message */}
          {error && (
            <p className="text-[11px] text-[rgba(255,120,120,0.9)] font-body tracking-[0.04em]">
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full h-10 rounded-sm text-[11px] font-bold tracking-[0.06em] uppercase cursor-pointer font-body transition-all duration-200 border-none bg-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.8)] hover:bg-[rgba(255,255,255,0.2)] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "..." : "Anmelden"}
          </button>
        </div>
      </form>
    </div>
  );
}
