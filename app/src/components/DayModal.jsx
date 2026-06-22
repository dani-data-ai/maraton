import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import { getReadingForDay, getDayNumberForDate, PLAN_META } from "../data/plans";

export default function DayModal({ dateStr, plan, entry, steps, stepCompletions, onClose, onSave }) {
  const [thought, setThought] = useState(entry?.thought || "");
  const [saving, setSaving] = useState(false);
  const [checked, setChecked] = useState(!!entry);

  const dayNum = plan ? getDayNumberForDate(plan.planType, plan.startDate, dateStr) : null;
  const reading = plan && dayNum ? getReadingForDay(plan.planType, dayNum) : null;

  const handleSave = async () => {
    if (!plan || !dayNum) return;
    setSaving(true);
    if (checked) {
      await fetch("/api/reading/entry", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr, dayNumber: dayNum, thought }),
      });
    } else {
      await fetch(`/api/reading/entry/${dateStr}`, { method: "DELETE", credentials: "include" });
    }
    setSaving(false);
    onSave();
    onClose();
  };

  const toggleStep = async (stepId) => {
    await fetch(`/api/extrasteps/${stepId}/complete`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateStr }),
    });
    onSave();
  };

  const isStepDone = (stepId) =>
    stepCompletions.some((c) => c.stepId === stepId && c.date === dateStr);

  const dateLabel = format(parseISO(dateStr), "d MMMM yyyy", { locale: ro });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div className="modal-title">{dateLabel}</div>
            {dayNum && (
              <div style={{ fontSize: "0.75rem", color: "var(--gold)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>
                Ziua {dayNum} din {PLAN_META[plan?.planType]?.days}
              </div>
            )}
          </div>
          <button className="btn-icon" onClick={onClose} style={{ flexShrink: 0 }}>
            <CloseIcon />
          </button>
        </div>

        {/* Reading section */}
        {reading ? (
          <div style={{ marginBottom: 20 }}>
            <div className="section-title">Lectura de azi</div>
            <div className="reading-text">{reading}</div>

            {/* Check + thought */}
            <div
              onClick={() => setChecked((c) => !c)}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                background: checked ? "var(--green-dim)" : "var(--bg3)",
                border: `1px solid ${checked ? "var(--green)" : "var(--border)"}`,
                borderRadius: "var(--radius-sm)", cursor: "pointer", marginBottom: 12, transition: "all 0.18s ease"
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                background: checked ? "var(--green)" : "transparent",
                border: `2px solid ${checked ? "var(--green)" : "var(--text3)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.18s ease"
              }}>
                {checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#0f0f0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span style={{ fontSize: "0.9rem", color: checked ? "var(--green)" : "var(--text2)", fontWeight: checked ? 500 : 400 }}>
                {checked ? "Am citit azi ✓" : "Marchează ca citit"}
              </span>
            </div>

            {checked && (
              <div style={{ animation: "fadeIn 0.2s ease both" }}>
                <label>Gândul tău (opțional)</label>
                <textarea
                  value={thought}
                  onChange={(e) => setThought(e.target.value)}
                  placeholder="Ce te-a impresionat, ce ți-a vorbit Dumnezeu astăzi..."
                  style={{ minHeight: 90 }}
                />
              </div>
            )}
          </div>
        ) : !plan ? (
          <div className="empty-state" style={{ padding: "20px 0" }}>
            <p>Nu ai un plan de citire asignat de mentor.</p>
          </div>
        ) : null}

        {/* Extra steps */}
        {steps.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div className="section-title">Activități pentru azi</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {steps.map((step) => {
                const done = isStepDone(step.id);
                return (
                  <div
                    key={step.id}
                    onClick={() => toggleStep(step.id)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px",
                      background: done ? "var(--blue-dim)" : "var(--bg3)",
                      border: `1px solid ${done ? "var(--blue)" : "var(--border)"}`,
                      borderRadius: "var(--radius-sm)", cursor: "pointer", transition: "all 0.18s ease"
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: 50,
                      background: done ? "var(--blue)" : "transparent",
                      border: `2px solid ${done ? "var(--blue)" : "var(--text3)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 1, transition: "all 0.18s ease"
                    }}>
                      {done && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 4-4" stroke="#0f0f0d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 500, color: done ? "var(--blue)" : "var(--text)" }}>{step.title}</div>
                      {step.description && <div style={{ fontSize: "0.78rem", color: "var(--text3)", marginTop: 2 }}>{step.description}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Save */}
        {plan && dayNum && (
          <button className="btn-primary" style={{ width: "100%" }} onClick={handleSave} disabled={saving}>
            {saving ? "Se salvează..." : "Salvează"}
          </button>
        )}
      </div>
    </div>
  );
}

function CloseIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>;
}
