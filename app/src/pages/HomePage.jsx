import { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { PLAN_META, getDayNumberForDate } from "../data/plans";
import DayModal from "../components/DayModal";
import RingCalendar from "../components/RingCalendar";

const TODAY = format(new Date(), "yyyy-MM-dd");
const THIS_MONTH = format(new Date(), "yyyy-MM");

export default function HomePage({ user }) {
  const [plan, setPlan]               = useState(null);
  const [entries, setEntries]         = useState([]);
  const [vigilMonths, setVigilMonths] = useState([]);
  const [extraSteps, setExtraSteps]   = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMonth, setViewMonth]     = useState(new Date());
  const [loading, setLoading]         = useState(true);

  const load = useCallback(async () => {
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch("/api/reading/my", { credentials: "include" }).then((r) => r.json()),
        fetch("/api/vigil",      { credentials: "include" }).then((r) => r.json()),
        fetch("/api/extrasteps/my", { credentials: "include" }).then((r) => r.json()),
      ]);
      setPlan(r1.plan || null);
      setEntries(r1.entries || []);
      setVigilMonths(r2 || []);
      setExtraSteps(r3 || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const entriesByDate = useMemo(
    () => Object.fromEntries(entries.map((e) => [e.date, e])),
    [entries]
  );

  const readDates = useMemo(() => new Set(entries.map((e) => e.date)), [entries]);

  const stepsForDate = useCallback((dateStr) => {
    return extraSteps.filter((s) => {
      if (!s.isRecurring) return s.date === dateStr;
      const d = new Date(dateStr);
      if (s.startDate && dateStr < s.startDate) return false;
      if (s.endDate   && dateStr > s.endDate)   return false;
      const dayName = ["SUN","MON","TUE","WED","THU","FRI","SAT"][d.getDay()];
      if (s.recurrence === "DAILY") return true;
      if (s.recurrence === "WEEKLY") {
        if (!s.startDate) return false;
        return new Date(s.startDate).getDay() === d.getDay();
      }
      if (s.recurrence === "MONTHLY") {
        if (!s.startDate) return false;
        return new Date(s.startDate).getDate() === d.getDate();
      }
      return s.recurrence?.split(",").includes(dayName);
    });
  }, [extraSteps]);

  // Build stepDates Set for the visible month
  const stepDates = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
    const set = new Set();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${monthStr}-${String(d).padStart(2, "0")}`;
      if (stepsForDate(dateStr).length > 0) set.add(dateStr);
    }
    return set;
  }, [extraSteps, viewMonth, stepsForDate]);

  const handleVigilToggle = async () => {
    const res = await fetch("/api/vigil/toggle", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month: THIS_MONTH }),
    });
    if (res.ok) {
      const { marked } = await res.json();
      setVigilMonths((prev) => marked ? [...prev, THIS_MONTH] : prev.filter((m) => m !== THIS_MONTH));
    }
  };

  const daysRead  = entries.length;
  const totalDays = PLAN_META[plan?.planType]?.days || 0;
  const pct       = totalDays ? Math.round((daysRead / totalDays) * 100) : 0;

  const vigilDone = vigilMonths.includes(THIS_MONTH);
  const planMeta  = plan ? PLAN_META[plan.planType] : null;

  const handleDayClick = (dateStr) => {
    if (!plan) return;
    const dayNum = getDayNumberForDate(plan.planType, plan.startDate, dateStr);
    if (!dayNum) return;
    setSelectedDate(dateStr);
  };

  if (loading) return (
    <div className="fade-in" style={{ padding: "60px 0", textAlign: "center" }}>
      <div className="pulse" style={{ color: "var(--gold)", fontFamily: "Lora, serif", fontSize: "1.4rem" }}>Maraton</div>
    </div>
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="app-header">
        <div className="app-header-eyebrow">O dată în viață</div>
        <div className="app-header-title">Maraton Biblie</div>
      </div>

      <div className="app-content">
        {/* Stats */}
        {plan && (
          <div className="stat-row" style={{ marginTop: 16 }}>
            <div className="stat-box">
              <div className="stat-big">{daysRead}</div>
              <div className="stat-small">Zile citite</div>
            </div>
            <div className="stat-box">
              <div className="stat-big">{pct}%</div>
              <div className="stat-small">Progres</div>
            </div>
            <div className="stat-box">
              <div className="stat-big">{totalDays - daysRead}</div>
              <div className="stat-small">Rămase</div>
            </div>
          </div>
        )}

        {/* Plan info */}
        {plan ? (
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--text3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Planul tău</div>
                <div style={{ fontSize: "0.95rem", color: "var(--text)", fontWeight: 500 }}>{planMeta?.label}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text3)", marginTop: 2 }}>Start: {plan.startDate}</div>
              </div>
              <div style={{ width: 56, height: 56, position: "relative" }}>
                <svg viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="28" cy="28" r="22" fill="none" stroke="var(--border)" strokeWidth="4" />
                  <circle cx="28" cy="28" r="22" fill="none" stroke="var(--gold)" strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
                    strokeLinecap="round" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, color: "var(--gold)" }}>{pct}%</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 16, textAlign: "center", padding: "28px 20px" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>📖</div>
            <div style={{ fontSize: "0.95rem", color: "var(--text2)", marginBottom: 4 }}>Niciun plan asignat</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text3)" }}>Mentorul tău va alege un plan de citire pentru tine</div>
          </div>
        )}

        {/* Ring Calendar */}
        <div className="card" style={{ marginBottom: 16, paddingTop: 20, paddingBottom: 20 }}>
          <RingCalendar
            today={TODAY}
            readDates={readDates}
            stepDates={stepDates}
            onDayClick={handleDayClick}
            viewMonth={viewMonth}
            setViewMonth={setViewMonth}
          />
        </div>

        {/* Vigilia lunara */}
        <div className="card">
          <div className="section-title">Vigilia lunară</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text2)", marginBottom: 14 }}>
            {format(new Date(), "MMMM yyyy", { locale: ro })}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              {vigilDone ? (
                <span className="badge badge-green">✓ Vigilia făcută</span>
              ) : (
                <span style={{ fontSize: "0.85rem", color: "var(--text3)" }}>Nu ai marcat vigilia acestei luni</span>
              )}
            </div>
            <button
              className={vigilDone ? "btn-ghost" : "btn-primary"}
              style={{ fontSize: "0.8rem", padding: "8px 18px" }}
              onClick={handleVigilToggle}
            >
              {vigilDone ? "Anulează" : "Marchează"}
            </button>
          </div>
        </div>
      </div>

      {selectedDate && (
        <DayModal
          dateStr={selectedDate}
          plan={plan}
          entry={entriesByDate[selectedDate] || null}
          steps={stepsForDate(selectedDate)}
          stepCompletions={extraSteps.flatMap((s) => s.completions || [])}
          onClose={() => setSelectedDate(null)}
          onSave={load}
        />
      )}
    </div>
  );
}
