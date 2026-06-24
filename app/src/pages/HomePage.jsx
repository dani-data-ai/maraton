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
        fetch("/api/reading/my",      { credentials: "include" }).then((r) => r.json()),
        fetch("/api/vigil",           { credentials: "include" }).then((r) => r.json()),
        fetch("/api/extrasteps/my",   { credentials: "include" }).then((r) => r.json()),
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

        {/* Compact stats */}
        {plan && (
          <div className="stat-row" style={{ marginTop: 14 }}>
            <div className="stat-box">
              <div className="stat-big">{daysRead}</div>
              <div className="stat-small">Citite</div>
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

        {/* Hero calendar */}
        <div className="card-hero">
          {!plan && (
            <div style={{ textAlign: "center", paddingBottom: 12, borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text3)" }}>Niciun plan asignat — mentorul tău va alege unul</div>
            </div>
          )}
          <RingCalendar
            today={TODAY}
            readDates={readDates}
            stepDates={stepDates}
            onDayClick={handleDayClick}
            viewMonth={viewMonth}
            setViewMonth={setViewMonth}
          />
        </div>

        {/* Compact info row: plan + vigilia */}
        <div className="info-row">
          {/* Plan pill */}
          <div className="info-pill" style={{ flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
            <div className="info-pill-label">Plan</div>
            <div className="info-pill-val">
              {planMeta ? planMeta.label : <span style={{ color: "var(--text3)" }}>Neasignat</span>}
            </div>
            {plan && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, width: "100%" }}>
                <div style={{ flex: 1, height: 3, background: "var(--bg3)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "var(--gold)", borderRadius: 2, transition: "width 0.6s ease" }} />
                </div>
                <span style={{ fontSize: "0.62rem", color: "var(--gold)", fontWeight: 600 }}>{pct}%</span>
              </div>
            )}
          </div>

          {/* Vigilia pill */}
          <div
            className="info-pill"
            onClick={handleVigilToggle}
            style={{ flexDirection: "column", alignItems: "flex-start", gap: 2 }}
          >
            <div className="info-pill-label">Vigilie lunară</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: vigilDone ? "var(--green)" : "transparent",
                border: `2px solid ${vigilDone ? "var(--green)" : "var(--text3)"}`,
                transition: "all 0.2s ease",
              }} />
              <span style={{ fontSize: "0.78rem", fontWeight: 500, color: vigilDone ? "var(--green)" : "var(--text3)" }}>
                {vigilDone ? "Făcută" : "Marchează"}
              </span>
            </div>
            <div style={{ fontSize: "0.62rem", color: "var(--text3)", marginTop: 2 }}>
              {format(new Date(), "MMMM yyyy", { locale: ro })}
            </div>
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
