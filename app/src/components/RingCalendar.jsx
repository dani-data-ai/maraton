import { useEffect, useRef, useState } from "react";

const MONTH_NAMES = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie',
  'Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
const DOW = ['Du','Lu','Ma','Mi','Jo','Vi','Sâ'];
const DOW_FULL = ['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă'];

const BASE = 320, GAP = 0.015, SCALE_Y = 0.82;

function getSize() { return Math.min(BASE, window.innerWidth - 48); }
function dims(size) {
  const s = size / BASE;
  return { CX: size / 2, CY: size / 2, R_OUT: Math.round(148 * s), R_IN: Math.round(60 * s) };
}

export default function RingCalendar({ today, readDates = new Set(), stepDates = new Set(), onDayClick, viewMonth, setViewMonth }) {
  const canvasRef  = useRef(null);
  const overlayRef = useRef(null);
  const animRef    = useRef(null);
  const [tip, setTip]   = useState(null);
  const [size, setSize] = useState(getSize);

  useEffect(() => {
    const onResize = () => setSize(getSize());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const dpr = window.devicePixelRatio || 1;
    const h = Math.round(size * SCALE_Y);
    overlay.width  = size * dpr;
    overlay.height = h * dpr;
    overlay.style.width  = size + "px";
    overlay.style.height = h + "px";
  }, [size]);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  const year        = viewMonth.getFullYear();
  const month       = viewMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthStr    = `${year}-${String(month + 1).padStart(2, "0")}`;

  const todayDate      = new Date(today + "T00:00:00");
  const todayDay       = todayDate.getDate();
  const isCurrentMonth = todayDate.getFullYear() === year && todayDate.getMonth() === month;

  function ds(day) {
    return `${monthStr}-${String(day).padStart(2, "0")}`;
  }

  function stateOf(day) {
    const dateStr = ds(day);
    return {
      dateStr,
      isToday:  dateStr === today,
      isPast:   dateStr <  today,
      isFuture: dateStr >  today,
      isRead:   readDates.has(dateStr),
      hasStep:  stepDates.has(dateStr),
    };
  }

  // ── canvas draw ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { CX, CY, R_OUT, R_IN } = dims(size);

    const dpr = window.devicePixelRatio || 1;
    const h = Math.round(size * SCALE_Y);
    canvas.width  = size * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = size + "px";
    canvas.style.height = h + "px";

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.scale(1, SCALE_Y);
    ctx.clearRect(0, 0, size, size);

    const arcPerDay = (2 * Math.PI) / daysInMonth;

    // Shared vertical gradient (light source = top of ring)
    function makeGrad(top, bottom) {
      const g = ctx.createLinearGradient(CX, CY - R_OUT, CX, CY + R_OUT);
      g.addColorStop(0, top);
      g.addColorStop(1, bottom);
      return g;
    }

    // Pre-build gradients for each state
    const gradRead    = makeGrad("#3fa865", "#1d5535");
    const gradPast    = makeGrad("#352020", "#181010");
    const gradToday   = makeGrad("rgba(230,180,70,0.38)", "rgba(180,130,40,0.14)");
    const gradFuture  = makeGrad("rgba(255,255,255,0.055)", "rgba(255,255,255,0.018)");

    for (let day = 1; day <= daysInMonth; day++) {
      const { isToday, isPast, isFuture, isRead, hasStep } = stateOf(day);
      const sa  = -Math.PI / 2 + (day - 1) * arcPerDay + GAP / 2;
      const ea  = sa + arcPerDay - GAP;
      const mid = sa + (arcPerDay - GAP) / 2;

      // ── 1. Main segment fill (gradient) ──────────────────────────────
      let fill;
      if (isRead)        fill = gradRead;
      else if (isToday)  fill = gradToday;
      else if (isPast)   fill = gradPast;
      else               fill = gradFuture;

      ctx.beginPath();
      ctx.arc(CX, CY, R_OUT, sa, ea);
      ctx.arc(CX, CY, R_IN,  ea, sa, true);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();

      // ── 2. Outer rim highlight (raised top edge) ──────────────────────
      ctx.beginPath();
      ctx.arc(CX, CY, R_OUT - 0.5, sa + 0.005, ea - 0.005);
      ctx.strokeStyle = isRead
        ? "rgba(90,220,130,0.3)"
        : isToday
        ? "rgba(255,210,90,0.5)"
        : isPast
        ? "rgba(90,55,55,0.35)"
        : "rgba(255,255,255,0.055)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ── 3. Inner rim shadow (depth groove) ───────────────────────────
      ctx.beginPath();
      ctx.arc(CX, CY, R_IN + 0.5, sa + 0.005, ea - 0.005);
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ── 4. Today: gold border ─────────────────────────────────────────
      if (isToday) {
        ctx.beginPath();
        ctx.arc(CX, CY, R_OUT, sa, ea);
        ctx.arc(CX, CY, R_IN,  ea, sa, true);
        ctx.closePath();
        ctx.strokeStyle = "#d4a040";
        ctx.lineWidth   = 1.8;
        ctx.stroke();
      }

      // ── 5. Day number ─────────────────────────────────────────────────
      const midR = (R_OUT + R_IN) / 2;
      const tx   = CX + midR * Math.cos(mid);
      const ty   = CY + midR * Math.sin(mid);

      let numColor;
      if (isRead)        numColor = "rgba(255,255,255,0.85)";
      else if (isToday)  numColor = "#f0c060";
      else if (isFuture) numColor = "rgba(255,255,255,0.14)";
      else               numColor = "rgba(255,255,255,0.32)";

      ctx.font         = isToday ? `bold ${Math.round(12 * size / BASE)}px sans-serif` : `${Math.round(12 * size / BASE)}px sans-serif`;
      ctx.fillStyle    = numColor;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(day), tx, ty);

      // ── 6. Day-of-week label outside ring ────────────────────────────
      const dowIdx = new Date(year, month, day).getDay();
      const outerR = R_OUT + 10;
      const ox = CX + outerR * Math.cos(mid);
      const oy = CY + outerR * Math.sin(mid);
      ctx.font      = `${Math.round(8 * size / BASE)}px sans-serif`;
      ctx.fillStyle = "rgba(107,104,96,0.6)";
      ctx.fillText(DOW[dowIdx], ox, oy);

      // ── 7. Extra step dot ─────────────────────────────────────────────
      if (hasStep) {
        const dotR = R_OUT - 6;
        const dotX = CX + dotR * Math.cos(mid);
        const dotY = CY + dotR * Math.sin(mid);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2.5, 0, 2 * Math.PI);
        ctx.fillStyle = isRead ? "rgba(240,192,80,0.8)" : "#d4a040";
        ctx.fill();
      }
    }

    // ── Center hole fill ─────────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(CX, CY, R_IN - 2, 0, 2 * Math.PI);
    // Deep shadow ring just inside the inner edge
    const innerGlow = ctx.createRadialGradient(CX, CY, R_IN - 14, CX, CY, R_IN - 2);
    innerGlow.addColorStop(0, "#1a1915");
    innerGlow.addColorStop(1, "#0f0e0b");
    ctx.fillStyle = innerGlow;
    ctx.fill();
  }, [readDates, stepDates, today, daysInMonth, size, year, month]);

  // ── press animation ──────────────────────────────────────────────────
  function drawOverlaySegment(day, color) {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const dpr = window.devicePixelRatio || 1;
    const { CX, CY, R_OUT, R_IN } = dims(size);
    const ctx = overlay.getContext("2d");
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    if (!color) return;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.scale(1, SCALE_Y);
    const arcPerDay = (2 * Math.PI) / daysInMonth;
    const sa = -Math.PI / 2 + (day - 1) * arcPerDay + GAP / 2;
    const ea = sa + arcPerDay - GAP;
    ctx.beginPath();
    ctx.arc(CX, CY, R_OUT, sa, ea);
    ctx.arc(CX, CY, R_IN,  ea, sa, true);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function animatePress(day) {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const t0 = performance.now();
    const PRESS = 65, RELEASE = 300;
    function tick() {
      const elapsed = performance.now() - t0;
      if (elapsed < PRESS) {
        const p = elapsed / PRESS;
        drawOverlaySegment(day, `rgba(0,0,0,${(p * 0.22).toFixed(3)})`);
        animRef.current = requestAnimationFrame(tick);
      } else {
        const p = Math.min((elapsed - PRESS) / RELEASE, 1);
        if (p < 1) {
          drawOverlaySegment(day, `rgba(212,160,64,${((1 - p) * 0.42).toFixed(3)})`);
          animRef.current = requestAnimationFrame(tick);
        } else {
          drawOverlaySegment(day, null);
        }
      }
    }
    animRef.current = requestAnimationFrame(tick);
  }

  // ── hit test ─────────────────────────────────────────────────────────
  function hitDay(e) {
    const { CX, CY, R_OUT, R_IN } = dims(size);
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = (clientY - rect.top) / SCALE_Y;
    const dx = x - CX, dy = y - CY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < R_IN || dist > R_OUT) return null;
    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;
    const day = Math.floor(angle / ((2 * Math.PI) / daysInMonth)) + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  }

  function handleClick(e) {
    const day = hitDay(e);
    if (!day) return;
    const { dateStr, isFuture } = stateOf(day);
    if (isFuture) return;
    animatePress(day);
    onDayClick && onDayClick(dateStr);
  }

  function handleMouseMove(e) {
    const day = hitDay(e);
    if (!day) { setTip(null); if (canvasRef.current) canvasRef.current.style.cursor = "default"; return; }

    const { isToday, isPast, isFuture, isRead, hasStep } = stateOf(day);
    const dowIdx = new Date(year, month, day).getDay();
    const line1 = `${day} ${MONTH_NAMES[month]} — ${DOW_FULL[dowIdx]}`;
    let hint = "";
    if (isRead)        hint = "✓ citit";
    else if (isToday)  hint = "astăzi — apasă pentru detalii";
    else if (isPast)   hint = "apasă pentru detalii";
    if (hasStep) hint += (hint ? " · " : "") + "are activitate extra";

    const rect = canvasRef.current.getBoundingClientRect();
    setTip({ x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 12, line1, hint });
    canvasRef.current.style.cursor = isFuture ? "default" : "pointer";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* Month navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, width: "100%", maxWidth: size }}>
        <button
          onClick={() => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))}
          style={{ background: "none", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8,
            padding: "6px 12px", color: "#aea9a4", cursor: "pointer", fontSize: 16, lineHeight: 1 }}
        >
          ‹
        </button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 14, fontWeight: 600,
          color: "#e8e6df", fontFamily: "'Lora', serif" }}>
          {MONTH_NAMES[month]} {year}
        </div>
        <button
          onClick={() => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))}
          style={{ background: "none", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8,
            padding: "6px 12px", color: "#aea9a4", cursor: "pointer", fontSize: 16, lineHeight: 1 }}
        >
          ›
        </button>
      </div>

      {/* Ring canvas */}
      <div style={{ position: "relative", width: size, height: Math.round(size * SCALE_Y) }}>
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          onMouseDown={(e) => { const d = hitDay(e); if (d) animatePress(d); }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setTip(null); if (canvasRef.current) canvasRef.current.style.cursor = "default"; }}
          style={{ display: "block" }}
        />
        <canvas
          ref={overlayRef}
          style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "block" }}
        />

        {/* Center overlay */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          textAlign: "center", pointerEvents: "none",
        }}>
          {isCurrentMonth ? (
            <>
              <div style={{ fontSize: 32, fontWeight: 600, color: "#d4a040",
                fontFamily: "'Lora', serif", lineHeight: 1 }}>{todayDay}</div>
              <div style={{ fontSize: 11, color: "#6b6860", textTransform: "uppercase",
                letterSpacing: ".08em", marginTop: 4 }}>{MONTH_NAMES[todayDate.getMonth()]}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#6b6860",
                fontFamily: "'Lora', serif", lineHeight: 1.2 }}>{MONTH_NAMES[month]}</div>
              <div style={{ fontSize: 12, color: "#4a4840", marginTop: 4 }}>{year}</div>
            </>
          )}
        </div>

        {/* Tooltip */}
        {tip && (
          <div style={{
            position: "absolute", left: tip.x, top: tip.y,
            background: "#2a2a26", border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 8, padding: "6px 10px",
            fontSize: 11, color: "#aea9a4", lineHeight: 1.55,
            pointerEvents: "none", zIndex: 10, maxWidth: 190,
          }}>
            <div style={{ color: "#e8e6e1", fontWeight: 600 }}>{tip.line1}</div>
            {tip.hint && <div style={{ marginTop: 2 }}>{tip.hint}</div>}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { color: "#2d7a4f", label: "Citit" },
          { color: "rgba(212,160,64,0.25)", border: "1px solid #d4a040", label: "Azi" },
          { color: "#d4a040", dot: true, label: "Activitate" },
        ].map(({ color, border, dot, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.7rem", color: "#6b6860" }}>
            {dot ? (
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
            ) : (
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color, border: border || "none" }} />
            )}
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
