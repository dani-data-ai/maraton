import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { PLAN_META } from "../data/plans";

export default function ContPage() {
  const { user, setUser } = useContext(AuthContext);
  const isMentor = user?.role === "MENTOR";
  return (
    <div className="fade-in">
      <div className="app-header">
        <div className="app-header-eyebrow">Profil</div>
        <div className="app-header-title">Contul meu</div>
      </div>
      <div className="app-content">
        <ProfileCard user={user} setUser={setUser} />
        <div className="divider" style={{ margin: "20px 0" }} />
        {isMentor ? <MentorSection /> : <ScutierSection user={user} />}
        <div className="divider" style={{ margin: "20px 0" }} />
        <LogoutButton setUser={setUser} />
      </div>
    </div>
  );
}

function ProfileCard({ user, setUser }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");

  const save = async () => {
    const res = await fetch("/api/auth/profile", {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) { const u = await res.json(); setUser((prev) => ({ ...prev, name: u.name })); setEditing(false); }
  };

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--gold-dim)", border: "2px solid var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", color: "var(--gold)", fontFamily: "Lora, serif", fontWeight: 600, flexShrink: 0 }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: "1rem" }}>{user?.name}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text3)", marginTop: 2 }}>{user?.email}</div>
        </div>
        <span className={`badge ${user?.role === "MENTOR" ? "badge-gold" : "badge-blue"}`}>
          {user?.role === "MENTOR" ? "Mentor" : "Scutier"}
        </span>
      </div>
      {editing ? (
        <div>
          <div className="form-group">
            <label>Nume</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={save}>Salvează</button>
            <button className="btn-ghost" onClick={() => setEditing(false)}>Anulează</button>
          </div>
        </div>
      ) : (
        <button className="btn-ghost" style={{ fontSize: "0.82rem", padding: "8px 16px" }} onClick={() => setEditing(true)}>
          Editează profil
        </button>
      )}
    </div>
  );
}

function ScutierSection({ user }) {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch("/api/reading/my", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setData(d); setHistory(d.entries || []); });
  }, []);

  const plan = data?.plan;
  const planMeta = plan ? PLAN_META[plan.planType] : null;

  return (
    <div>
      <div className="section-title">Planul de citire</div>
      {plan ? (
        <div className="card-sm" style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{planMeta?.label}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text3)" }}>Start: {plan.startDate}</div>
          {user?.mentor && (
            <div style={{ fontSize: "0.78rem", color: "var(--text3)", marginTop: 4 }}>
              Mentor: <span style={{ color: "var(--text2)" }}>{user.mentor.name}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state" style={{ padding: "20px 0" }}>
          <p>Mentorul tău nu ți-a asignat încă un plan de citire.</p>
        </div>
      )}

      {history.length > 0 && (
        <>
          <div className="section-title" style={{ marginTop: 20 }}>Istoricul citirilor</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...history].reverse().slice(0, 20).map((e) => (
              <div key={e.id} className="card-sm">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--text2)" }}>{e.date}</span>
                  <span className="badge badge-green" style={{ fontSize: "0.65rem" }}>Ziua {e.dayNumber}</span>
                </div>
                {e.thought && (
                  <div style={{ fontSize: "0.82rem", color: "var(--text3)", marginTop: 6, fontStyle: "italic", borderLeft: "2px solid var(--border)", paddingLeft: 10 }}>
                    "{e.thought}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MentorSection() {
  const [scutieri, setScutieri] = useState([]);
  const [invites, setInvites] = useState([]);
  const [newInvite, setNewInvite] = useState(null);
  const [selectedScutier, setSelectedScutier] = useState(null);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showStepForm, setShowStepForm] = useState(false);
  const [extraSteps, setExtraSteps] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [s, i, e] = await Promise.all([
      fetch("/api/mentor/scutieri", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/mentor/invites", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/extrasteps/created", { credentials: "include" }).then((r) => r.json()),
    ]);
    setScutieri(s);
    setInvites(i.filter((inv) => !inv.usedBy).slice(0, 5));
    setExtraSteps(e);
  };

  const generateInvite = async () => {
    const res = await fetch("/api/mentor/invite", { method: "POST", credentials: "include" });
    const { code } = await res.json();
    setNewInvite(code);
    loadData();
  };

  const deleteStep = async (id) => {
    await fetch(`/api/extrasteps/${id}`, { method: "DELETE", credentials: "include" });
    loadData();
  };

  return (
    <div>
      {/* Scutierii */}
      <div className="section-title">Scutierii mei ({scutieri.length})</div>
      {scutieri.length === 0 ? (
        <div className="empty-state" style={{ padding: "20px 0" }}>
          <p>Niciun scutier înregistrat încă.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {scutieri.map((s) => (
            <div key={s.id} className="card-sm" style={{ cursor: "pointer" }} onClick={() => setSelectedScutier(selectedScutier?.id === s.id ? null : s)}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{s.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text3)" }}>{s.email}</div>
                </div>
                {s.readingPlan ? (
                  <span className="badge badge-green" style={{ fontSize: "0.65rem" }}>{PLAN_META[s.readingPlan.planType]?.label?.split(" ").slice(0, 2).join(" ")}</span>
                ) : (
                  <span className="badge" style={{ fontSize: "0.65rem", background: "var(--bg3)", color: "var(--text3)" }}>Fără plan</span>
                )}
              </div>
              {selectedScutier?.id === s.id && (
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button className="btn-ghost" style={{ fontSize: "0.78rem", padding: "6px 14px" }} onClick={(e) => { e.stopPropagation(); setShowPlanForm(true); }}>
                    {s.readingPlan ? "Schimbă planul" : "Asignează plan"}
                  </button>
                  <button className="btn-ghost" style={{ fontSize: "0.78rem", padding: "6px 14px", borderColor: "var(--blue)", color: "var(--blue)" }} onClick={(e) => { e.stopPropagation(); setShowStepForm(true); }}>
                    + Activitate
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Plan form */}
      {showPlanForm && selectedScutier && (
        <AssignPlanForm
          scutier={selectedScutier}
          onSave={() => { setShowPlanForm(false); loadData(); }}
          onClose={() => setShowPlanForm(false)}
        />
      )}

      {/* Extra step form */}
      {showStepForm && selectedScutier && (
        <ExtraStepForm
          scutier={selectedScutier}
          onSave={() => { setShowStepForm(false); loadData(); }}
          onClose={() => setShowStepForm(false)}
        />
      )}

      {/* Extra steps list */}
      {extraSteps.length > 0 && (
        <>
          <div className="section-title" style={{ marginTop: 20 }}>Activitati create</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {extraSteps.map((step) => (
              <div key={step.id} className="card-sm">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{step.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text3)", marginTop: 2 }}>
                      {step.scutier?.name} · {step.isRecurring ? step.recurrence : step.date}
                    </div>
                    {step.description && <div style={{ fontSize: "0.78rem", color: "var(--text3)", marginTop: 4 }}>{step.description}</div>}
                  </div>
                  <button className="btn-danger" style={{ flexShrink: 0, marginLeft: 8 }} onClick={() => deleteStep(step.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Invite codes */}
      <div className="section-title" style={{ marginTop: 8 }}>Coduri de invitație</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {invites.map((inv) => (
          <div key={inv.id} className="card-sm" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "monospace", fontSize: "1rem", color: "var(--gold)", letterSpacing: "0.1em" }}>{inv.code}</span>
            <span className="badge badge-green">Disponibil</span>
          </div>
        ))}
        {newInvite && (
          <div className="card-sm" style={{ background: "var(--gold-dim)", border: "1px solid var(--gold)", textAlign: "center" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--gold)", marginBottom: 4 }}>Cod nou generat</div>
            <div style={{ fontFamily: "monospace", fontSize: "1.2rem", color: "var(--gold)", fontWeight: 700, letterSpacing: "0.15em" }}>{newInvite}</div>
          </div>
        )}
      </div>
      <button className="btn-ghost" style={{ width: "100%" }} onClick={generateInvite}>
        + Generează cod invitație
      </button>
    </div>
  );
}

function AssignPlanForm({ scutier, onSave, onClose }) {
  const [planType, setPlanType] = useState("GOSPELS_42");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await fetch("/api/reading/assign", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scutierId: scutier.id, planType, startDate }),
    });
    setSaving(false);
    onSave();
  };

  return (
    <div className="card" style={{ marginBottom: 16, border: "1px solid var(--gold)", background: "var(--gold-dim)" }}>
      <div style={{ fontWeight: 600, marginBottom: 14, fontSize: "0.9rem" }}>Asignează plan — {scutier.name}</div>
      <div className="form-group">
        <label>Plan de citire</label>
        <select value={planType} onChange={(e) => setPlanType(e.target.value)}>
          {Object.entries(PLAN_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Data de start</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn-primary" onClick={save} disabled={saving}>{saving ? "..." : "Salvează"}</button>
        <button className="btn-ghost" onClick={onClose}>Anulează</button>
      </div>
    </div>
  );
}

function ExtraStepForm({ scutier, onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [recurrence, setRecurrence] = useState("WEEKLY");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await fetch("/api/extrasteps", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scutierId: scutier.id, title, description, isRecurring, date: isRecurring ? null : date, recurrence: isRecurring ? recurrence : null, startDate: isRecurring ? startDate : null, endDate: isRecurring && endDate ? endDate : null }),
    });
    setSaving(false);
    onSave();
  };

  return (
    <div className="card" style={{ marginBottom: 16, border: "1px solid var(--blue)", background: "var(--blue-dim)" }}>
      <div style={{ fontWeight: 600, marginBottom: 14, fontSize: "0.9rem" }}>Activitate nouă — {scutier.name}</div>
      <div className="form-group">
        <label>Titlu</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: Zi de post, Rugăciune pentru..." />
      </div>
      <div className="form-group">
        <label>Descriere (opțional)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalii, instrucțiuni..." style={{ minHeight: 60 }} />
      </div>

      <div className="toggle-row" style={{ marginBottom: 12 }}>
        <span>Activitate recurentă</span>
        <div className={`toggle${isRecurring ? " on" : ""}`} onClick={() => setIsRecurring((v) => !v)}>
          <div className="toggle-thumb" />
        </div>
      </div>

      {!isRecurring ? (
        <div className="form-group">
          <label>Data</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      ) : (
        <>
          <div className="form-group">
            <label>Frecvență</label>
            <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
              <option value="DAILY">Zilnic</option>
              <option value="WEEKLY">Săptămânal</option>
              <option value="MONTHLY">Lunar</option>
              <option value="MON,WED,FRI">Luni, Miercuri, Vineri</option>
              <option value="MON,THU">Luni și Joi</option>
              <option value="SAT,SUN">Weekend</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Sfârșit (opț)</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn-primary" onClick={save} disabled={saving || !title.trim()}>{saving ? "..." : "Salvează"}</button>
        <button className="btn-ghost" onClick={onClose}>Anulează</button>
      </div>
    </div>
  );
}

function LogoutButton({ setUser }) {
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  };
  return (
    <button className="btn-danger" style={{ width: "100%", padding: "12px", fontSize: "0.85rem" }} onClick={logout}>
      Deconectare
    </button>
  );
}
