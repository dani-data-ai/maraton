import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function RegisterPage({ goLogin }) {
  const { setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ name: "", email: "", password: "", inviteCode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
          <div style={{ fontSize: "0.78rem", color: "var(--text3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Cont nou</div>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Nume</label>
            <input value={form.name} onChange={set("name")} placeholder="Numele tău" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set("email")} placeholder="adresa@email.com" required />
          </div>
          <div className="form-group">
            <label>Parolă</label>
            <input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" required />
          </div>
          <div className="form-group">
            <label>Cod de invitație</label>
            <input value={form.inviteCode} onChange={set("inviteCode")} placeholder="Cod primit de la mentor" required style={{ textTransform: "uppercase" }} />
          </div>
          {error && <div style={{ color: "var(--red)", fontSize: "0.82rem", marginBottom: 14 }}>{error}</div>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: 4 }}>
            {loading ? "Se creează contul..." : "Creează cont"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontSize: "0.82rem", color: "var(--text3)" }}>Ai deja cont? </span>
          <button onClick={goLogin} style={{ background: "none", color: "var(--gold)", fontSize: "0.82rem", fontWeight: 500, textDecoration: "underline" }}>
            Conectează-te
          </button>
        </div>
      </div>
    </div>
  );
}
