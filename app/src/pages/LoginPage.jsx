import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function LoginPage({ goRegister }) {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) { setUser(data); }
    else { setError(data.error || "Eroare"); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "Lora, serif", fontSize: "2.2rem", fontWeight: 600, color: "var(--gold)", marginBottom: 6 }}>Maraton</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Biblie · Credinţă · Disciplină</div>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="adresa@email.com" autoComplete="email" required />
          </div>
          <div className="form-group">
            <label>Parolă</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />
          </div>
          {error && <div style={{ color: "var(--red)", fontSize: "0.82rem", marginBottom: 14 }}>{error}</div>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: 4 }}>
            {loading ? "Se conectează..." : "Intră în cont"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontSize: "0.82rem", color: "var(--text3)" }}>Nu ai cont? </span>
          <button onClick={goRegister} style={{ background: "none", color: "var(--gold)", fontSize: "0.82rem", fontWeight: 500, textDecoration: "underline" }}>
            Înregistrează-te cu cod
          </button>
        </div>
      </div>
    </div>
  );
}
