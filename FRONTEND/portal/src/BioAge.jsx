import { useState, useRef, useEffect } from "react";

const REF = {
  albumin: { low: 3.5, high: 5.0, unit: "g/dL" },
  creatinine_m: { low: 0.74, high: 1.35, unit: "mg/dL" },
  creatinine_f: { low: 0.59, high: 1.04, unit: "mg/dL" },
  glucose: { low: 70, high: 100, unit: "mg/dL" },
  crp: { low: 0, high: 3.0, unit: "mg/L" },
  lymphocyte_pct: { low: 20, high: 40, unit: "%" },
  mcv: { low: 80, high: 100, unit: "fL" },
  rdw: { low: 11.5, high: 14.5, unit: "%" },
  alp: { low: 44, high: 147, unit: "U/L" },
  wbc: { low: 4.5, high: 11.0, unit: "10³/µL" },
};

function classify(v, l, h) {
  if (v < l * 0.8) return "critical_low";
  if (v < l) return "low";
  if (v > h * 1.3) return "critical_high";
  if (v > h) return "high";
  return "normal";
}

function dev(v, l, h) {
  if (v < l) return +(((l - v) / l) * 100).toFixed(1);
  if (v > h) return +(((v - h) / h) * 100).toFixed(1);
  return 0;
}

function sc(conds) {
  const tw = conds.reduce((s, [, w]) => s + w, 0);
  const e = conds.reduce((s, [c, w]) => s + (c ? w : 0), 0);
  return tw ? +((e / tw) * 100).toFixed(1) : 0;
}

function rl(s) {
  if (s < 25) return { label: "Low Risk", color: "#166534", bg: "rgba(22,101,52,0.15)", bar: "#22c55e", dot: "#16a34a" };
  if (s < 50) return { label: "Moderate Risk", color: "#92400e", bg: "rgba(146,64,14,0.15)", bar: "#f59e0b", dot: "#d97706" };
  if (s < 75) return { label: "High Risk", color: "#9a3412", bg: "rgba(154,52,18,0.15)", bar: "#f97316", dot: "#ea580c" };
  return { label: "Very High", color: "#7f1d1d", bg: "rgba(127,29,19,0.18)", bar: "#ef4444", dot: "#dc2626" };
}

function compute(inp) {
  const { age, albumin, creatinine, glucose, crp, lymphocyte_pct, mcv, rdw, alp, wbc, sex, pheno_age } = inp;
  const cr = sex === "male" ? REF.creatinine_m : REF.creatinine_f;

  const bios = [
    { name: "Albumin", value: albumin, ref: REF.albumin },
    { name: "Creatinine", value: creatinine, ref: cr },
    { name: "Glucose", value: glucose, ref: REF.glucose },
    { name: "CRP", value: crp, ref: REF.crp },
    { name: "Lymphocyte %", value: lymphocyte_pct, ref: REF.lymphocyte_pct },
    { name: "MCV", value: mcv, ref: REF.mcv },
    { name: "RDW", value: rdw, ref: REF.rdw },
    { name: "ALP", value: alp, ref: REF.alp },
    { name: "WBC", value: wbc, ref: REF.wbc },
  ].map((b) => ({
    ...b,
    unit: b.ref.unit,
    status: classify(b.value, b.ref.low, b.ref.high),
    deviation: dev(b.value, b.ref.low, b.ref.high),
    fillPct: Math.min(100, Math.max(5, ((b.value - b.ref.low * 0.5) / (b.ref.high * 1.5 - b.ref.low * 0.5)) * 100)),
  }));

  const diseases = [
    {
      name: "Cardiovascular Disease",
      icon: "❤",
      conds: [[crp > 3, 25], [rdw > 14.5, 20], [creatinine > cr.high, 15], [glucose > 100, 15], [albumin < 3.5, 10], [wbc > 10, 10], [age > 50, 5]],
      factors: [crp > 3 && `Elevated CRP (${crp} mg/L) — systemic inflammation`, rdw > 14.5 && `High RDW (${rdw}%) — red cell variability`, glucose > 100 && `Glucose ${glucose} mg/dL — metabolic stress`, wbc > 10 && `WBC ${wbc} — immune activation`].filter(Boolean),
      recs: [crp > 3 && "Reduce processed foods, sugar, trans fats", crp > 3 && "Omega-3 supplementation (fish oil 2g/day)", rdw > 14.5 && "Check iron, B12, and folate levels", glucose > 100 && "Walk 30 min after meals", !(crp > 3) && "Maintain 150 min/week aerobic exercise"].filter(Boolean),
    },
    {
      name: "Type 2 Diabetes",
      icon: "◈",
      conds: [[glucose > 125, 30], [glucose > 100, 20], [crp > 3, 20], [albumin < 3.8, 15], [age > 45, 10]],
      factors: [glucose > 125 && `Glucose ${glucose} mg/dL — diabetic range`, glucose > 100 && glucose <= 125 && `Glucose ${glucose} mg/dL — pre-diabetic`, crp > 3 && "Inflammation accelerates insulin resistance"].filter(Boolean),
      recs: [glucose > 125 && "Consult doctor for HbA1c immediately", glucose > 100 && "Adopt low glycemic index diet", crp > 3 && "Anti-inflammatory diet: turmeric, berries", glucose <= 100 && "Maintain healthy weight and activity"].filter(Boolean),
    },
    {
      name: "Kidney Disease",
      icon: "⬡",
      conds: [[creatinine > cr.high * 1.3, 30], [creatinine > cr.high, 20], [albumin < 3.5, 20], [glucose > 125, 15], [wbc > 10, 10], [age > 60, 5]],
      factors: [creatinine > cr.high * 1.3 && `Creatinine ${creatinine} — critically high`, creatinine > cr.high && creatinine <= cr.high * 1.3 && `Creatinine ${creatinine} — elevated`, albumin < 3.5 && `Albumin ${albumin} g/dL — protein loss`].filter(Boolean),
      recs: ["Increase water intake to 2.5–3L/day", "Avoid frequent NSAID use", creatinine > cr.high * 1.3 && "Urgent nephrology consultation"].filter(Boolean),
    },
    {
      name: "Liver Disease",
      icon: "◉",
      conds: [[alp > 191, 30], [alp > 147, 20], [albumin < 3.5, 25], [mcv > 100, 15], [wbc > 10, 10]],
      factors: [alp > 191 && `ALP ${alp} U/L — critically elevated`, alp > 147 && alp <= 191 && `ALP ${alp} U/L — elevated`, mcv > 100 && `MCV ${mcv} fL — liver/alcohol marker`, albumin < 3.5 && "Low albumin — protein synthesis concern"].filter(Boolean),
      recs: [alp > 147 && "Get ALT/AST liver panel", mcv > 100 && "Check B12 and folate; reduce alcohol", "Reduce alcohol and fatty food intake"].filter(Boolean),
    },
    {
      name: "Cancer / Immune Risk",
      icon: "◎",
      conds: [[lymphocyte_pct < 20, 25], [rdw > 14.5, 25], [crp > 5, 20], [wbc > 11, 15], [albumin < 3.5, 10], [age > 55, 5]],
      factors: [lymphocyte_pct < 20 && `Lymphocyte ${lymphocyte_pct}% — weakened immunity`, rdw > 14.5 && `RDW ${rdw}% — cell stress elevated`, crp > 5 && `CRP ${crp} — significant inflammation`, wbc > 11 && `WBC ${wbc} — hematologic concern`].filter(Boolean),
      recs: ["Vitamin D, Zinc, adequate sleep (7–9 hrs)", lymphocyte_pct < 20 && "Rule out lymphopenia causes", rdw > 14.5 && "Investigate iron, B12, folate deficiencies", "Annual comprehensive health checkup"].filter(Boolean),
    },
    {
      name: "Metabolic Syndrome",
      icon: "⬢",
      conds: [[glucose > 100, 25], [crp > 3, 25], [albumin < 3.8, 20], [rdw > 14, 15], [age > 40, 15]],
      factors: [glucose > 100 && `Glucose ${glucose} — insulin resistance`, crp > 3 && `CRP ${crp} — metabolic inflammation`, albumin < 3.8 && `Albumin ${albumin} — nutritional concern`].filter(Boolean),
      recs: ["Mediterranean diet strongly recommended", "150 min/week moderate aerobic activity", "Monitor waist circumference and BMI"],
    },
  ].map((d) => {
    const s = sc(d.conds);
    return { ...d, score: s, level: rl(s) };
  });

  const gap = +(pheno_age - age).toFixed(1);
  const aging = gap > 5 ? "Accelerated Aging" : gap < -5 ? "Decelerated Aging" : "Normal Aging";
  const avgRisk = diseases.reduce((s, d) => s + d.score, 0) / diseases.length;
  const health = Math.max(0, Math.min(100, +(100 - avgRisk - Math.max(0, gap * 1.5)).toFixed(1)));
  const allRecs = [];
  const seen = new Set();

  [...diseases].sort((a, b) => b.score - a.score).forEach((d) => d.recs.forEach((r) => {
    if (!seen.has(r) && allRecs.length < 6) {
      allRecs.push(r);
      seen.add(r);
    }
  }));

  return { bios, diseases, gap, aging, health, pheno_age, age, allRecs };
}

const BIO_CFG = {
  normal: { label: "OK", color: "#166534", bg: "rgba(22,101,52,0.14)", bar: "#22c55e" },
  low: { label: "LOW", color: "#1e40af", bg: "rgba(30,64,175,0.14)", bar: "#3b82f6" },
  high: { label: "HIGH", color: "#92400e", bg: "rgba(146,64,14,0.14)", bar: "#f59e0b" },
  critical_low: { label: "CRIT↓", color: "#7f1d1d", bg: "rgba(127,29,19,0.18)", bar: "#ef4444" },
  critical_high: { label: "CRIT↑", color: "#7f1d1d", bg: "rgba(127,29,19,0.18)", bar: "#ef4444" },
};

const FIELDS = [
  { key: "age", label: "Age", unit: "yrs", step: 1, min: 18, max: 100 },
  { key: "albumin", label: "Albumin", unit: "g/dL", step: 0.1, min: 1, max: 7 },
  { key: "creatinine", label: "Creatinine", unit: "mg/dL", step: 0.01, min: 0.3, max: 5 },
  { key: "glucose", label: "Glucose", unit: "mg/dL", step: 1, min: 40, max: 400 },
  { key: "crp", label: "CRP", unit: "mg/L", step: 0.1, min: 0, max: 30 },
  { key: "lymphocyte_pct", label: "Lymphocyte %", unit: "%", step: 0.1, min: 1, max: 70 },
  { key: "mcv", label: "MCV", unit: "fL", step: 0.5, min: 60, max: 140 },
  { key: "rdw", label: "RDW", unit: "%", step: 0.1, min: 8, max: 25 },
  { key: "alp", label: "ALP", unit: "U/L", step: 1, min: 10, max: 500 },
  { key: "wbc", label: "WBC", unit: "10³/µL", step: 0.1, min: 1, max: 30 },
];

const DEMO = { age: 52, pheno_age: 58.3, albumin: 3.8, creatinine: 1.3, glucose: 108, crp: 4.2, lymphocyte_pct: 18, mcv: 102, rdw: 15.1, alp: 160, wbc: 10.5, sex: "male" };

function DiseaseCard({ d, idx, visible }) {
  const [open, setOpen] = useState(false);
  const [bw, setBw] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setBw(d.score), 700 + idx * 90);
    return () => window.clearTimeout(timer);
  }, [visible, d.score, idx]);

  return (
    <div
      className="rounded-2xl p-4 cursor-pointer transition-all duration-200"
      style={{ background: "rgba(255,255,255,0.02)", border: open ? "1px solid rgba(212,92,41,0.3)" : "1px solid rgba(255,255,255,0.06)" }}
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex justify-between items-start mb-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm" style={{ background: d.level.bg }}>{d.icon}</div>
        <span className="text-2xl font-bold" style={{ fontFamily: "'DM Mono', monospace", color: d.level.dot }}>{d.score}%</span>
      </div>

      <div className="text-sm font-semibold mb-0.5" style={{ color: "#e8e3dc" }}>{d.name}</div>
      <div className="text-xs font-bold mb-2.5 tracking-wide" style={{ fontFamily: "'DM Mono', monospace", color: d.level.dot }}>{d.level.label}</div>

      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div className="h-full rounded-full" style={{ width: `${bw}%`, background: d.level.bar, transition: "width 1.1s cubic-bezier(.4,0,.2,1)" }} />
      </div>

      {open && (
        <div className="mt-3.5 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {d.factors.length > 0 && (
            <>
              <div className="text-xs mb-1.5 tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace", color: "#2e2e2b" }}>Factors</div>
              {d.factors.map((f, i) => (
                <div key={i} className="flex gap-1.5 text-xs mb-1 leading-relaxed" style={{ color: "#52524e" }}>
                  <span style={{ color: d.level.dot, flexShrink: 0 }}>▸</span>{f}
                </div>
              ))}
            </>
          )}
          <div className="text-xs mb-1.5 tracking-widest uppercase mt-2.5" style={{ fontFamily: "'DM Mono', monospace", color: "#2e2e2b" }}>Recommendations</div>
          {d.recs.map((r, i) => (
            <div key={i} className="flex gap-1.5 text-xs mb-1 leading-relaxed" style={{ color: "#6b6b64" }}>
              <span style={{ color: "#d45c29", flexShrink: 0 }}>→</span>{r}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BioAge({ onBack }) {
  const [sourceMode, setSourceMode] = useState(null);
  const [loadingDb, setLoadingDb] = useState(false);
  const [sourceError, setSourceError] = useState("");
  const [sourceInfo, setSourceInfo] = useState("");
  const [allowEdit, setAllowEdit] = useState(true);
  const [inp, setInp] = useState({
    age: DEMO.age,
    albumin: DEMO.albumin,
    creatinine: DEMO.creatinine,
    glucose: DEMO.glucose,
    crp: DEMO.crp,
    lymphocyte_pct: DEMO.lymphocyte_pct,
    mcv: DEMO.mcv,
    rdw: DEMO.rdw,
    alp: DEMO.alp,
    wbc: DEMO.wbc,
    sex: DEMO.sex,
  });
  const [report, setReport] = useState(null);
  const [ageOutput, setAgeOutput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [barW, setBarW] = useState({});
  const resultsRef = useRef();

  const loadFromDatabase = async () => {
    const userEmail = localStorage.getItem("userEmail") || "";
    if (!userEmail) {
      setSourceError("User email not found. Please log in again.");
      return;
    }

    setLoadingDb(true);
    setSourceError("");
    setSourceInfo("");

    try {
      const response = await fetch(`http://127.0.0.1:8000/reports/heabo-reports/latest?user_email=${encodeURIComponent(userEmail)}`);
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.detail || data?.message || "Failed to fetch latest report");
      }

      if (!data.data) {
        setSourceError("No marker data found in heabo_reports for this user.");
        return;
      }

      setInp((prev) => ({
        ...prev,
        age: Number(data.data.age ?? prev.age),
        albumin: Number(data.data.albumin ?? prev.albumin),
        creatinine: Number(data.data.creatinine ?? prev.creatinine),
        glucose: Number(data.data.glucose_mgdl ?? prev.glucose),
        crp: Number(data.data.crp ?? prev.crp),
        lymphocyte_pct: Number(data.data.lymphocyte_percent ?? prev.lymphocyte_pct),
        mcv: Number(data.data.mean_cell_volume ?? prev.mcv),
        rdw: Number(data.data.red_cell_dist_width ?? prev.rdw),
        alp: Number(data.data.alkaline_phosphatase ?? prev.alp),
        wbc: Number(data.data.wbc_for_age ?? prev.wbc),
      }));

      setSourceMode("database");
      setAllowEdit(false);
      setSourceInfo("Loaded latest marker record from heabo_reports. Review and edit if needed.");
      setReport(null);
      setAgeOutput("");
    } catch (err) {
      setSourceError(err.message || "Failed to load markers from database.");
    } finally {
      setLoadingDb(false);
    }
  };

  const useManualInput = () => {
    setSourceMode("manual");
    setAllowEdit(true);
    setSourceError("");
    setSourceInfo("Manual mode selected. Enter or adjust biomarker values.");
    setReport(null);
    setAgeOutput("");
  };

  const handleAnalyze = async () => {
    if (!sourceMode) {
      setSourceError("Select a source first: Database or Manual.");
      return;
    }

    setAnalyzing(true);
    setSourceError("");
    setReport(null);
    setAgeOutput("");

    try {
      const payload = {
        age: Number(inp.age),
        albumin: Number(inp.albumin),
        creatinine: Number(inp.creatinine),
        glucose_mgdl: Number(inp.glucose),
        crp: Number(inp.crp),
        lymphocyte_percent: Number(inp.lymphocyte_pct),
        mean_cell_volume: Number(inp.mcv),
        red_cell_dist_width: Number(inp.rdw),
        alkaline_phosphatase: Number(inp.alp),
        white_blood_cell_count: Number(inp.wbc),
      };

      const response = await fetch("http://127.0.0.1:8000/reports/heabo-reports/analyze-age", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.detail || data?.message || "Age analysis failed");
      }

      const backendBioAge = Number(data.data.biological_age);
      const r = compute({ ...inp, pheno_age: backendBioAge });
      setReport(r);
      setAgeOutput(data.data.formatted_output || "");

      const bws = {};
      r.bios.forEach((b) => { bws[b.name] = b.fillPct; });
      window.setTimeout(() => setBarW(bws), 250);
      window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 350);
    } catch (err) {
      setSourceError(err.message || "Failed to run age analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  const gc = !report ? "#d45c29" : report.gap > 5 ? "#ef4444" : report.gap < -5 ? "#22c55e" : "#f59e0b";
  const hc = !report ? "#d45c29" : report.health >= 70 ? "#22c55e" : report.health >= 45 ? "#f59e0b" : "#ef4444";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');
        html, body, #root { background: #0c0e0d; margin: 0; padding: 0; width: 100%; }
        body { font-family: 'Outfit', sans-serif; }
        @keyframes phSlideUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
        @keyframes phSpin { to { transform: rotate(360deg); } }
        .ph-results { animation: phSlideUp 0.55s ease both; }
        .ph-spin { display: inline-block; animation: phSpin 0.9s linear infinite; font-size: 18px; }
        .ph-section-label::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.05); }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
        select option { background: #1a1c1b; }
      `}</style>

      <div className="min-h-screen w-full" style={{ background: "#0c0e0d", color: "#e8e3dc", fontFamily: "'Outfit', sans-serif" }}>
        <nav className="sticky top-0 z-50 h-14 px-14 flex items-center justify-between" style={{ background: "rgba(12,14,13,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full" style={{ background: "#d45c29" }} />
            <span className="text-base font-semibold tracking-tight" style={{ color: "#f0ebe3" }}>BioAge</span>
            <span className="mx-1" style={{ color: "rgba(255,255,255,0.12)" }}>/</span>
            <span className="text-xs" style={{ color: "#3d3d39" }}>Disease Risk Engine</span>
          </div>
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="text-xs px-3 py-1.5 rounded-full tracking-widest transition-colors hover:bg-white/5"
                style={{ fontFamily: "'DM Mono', monospace", color: "#f0ebe3", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                ← Back
              </button>
            )}
            <span className="text-xs px-2.5 py-1 rounded-full tracking-widest" style={{ fontFamily: "'DM Mono', monospace", color: "#d45c29", border: "1px solid rgba(212,92,41,0.28)" }}>v2.0 · BETA</span>
          </div>
        </nav>

        <div className="max-w-screen-xl mx-auto px-14 pt-16 pb-12 grid gap-24 items-start" style={{ gridTemplateColumns: "1fr 520px" }}>
          <div>
            <div className="text-xs mb-5 tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace", color: "#d45c29" }}>Biological Age Analysis</div>
            <h1 className="text-6xl font-bold leading-tight mb-5" style={{ letterSpacing: "-0.035em", color: "#f0ebe3" }}>
              Predict your<br />
              <em className="not-italic" style={{ color: "#d45c29" }}>disease risk</em><br />
              from blood work
            </h1>
            <p className="text-base leading-relaxed max-w-lg" style={{ color: "#52524e" }}>
              Choose whether to use your latest biomarkers from database or enter values manually, then analyze biological age and disease risks.
            </p>
            <div className="flex gap-10 mt-11 pt-11" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {[["9", "Biomarkers analyzed"], ["6", "Disease risks scored"], ["100%", "Runs locally"]].map(([n, l]) => (
                <div key={l}>
                  <div className="text-3xl font-bold" style={{ fontFamily: "'DM Mono', monospace", color: "#e8e3dc" }}>{n}</div>
                  <div className="text-xs mt-1" style={{ color: "#3d3d39" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-2xl p-7" style={{ border: "1.5px dashed rgba(212,92,41,0.28)", background: "rgba(212,92,41,0.025)" }}>
              <div className="text-sm uppercase tracking-widest mb-3" style={{ fontFamily: "'DM Mono', monospace", color: "#d45c29" }}>
                Marker Data Source
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <button
                  type="button"
                  onClick={loadFromDatabase}
                  disabled={loadingDb}
                  className="px-4 py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60"
                  style={{ background: sourceMode === "database" ? "#d45c29" : "rgba(255,255,255,0.04)", color: sourceMode === "database" ? "#fff" : "#e8e3dc" }}
                >
                  {loadingDb ? "Loading..." : "Use Latest From Database"}
                </button>
                <button
                  type="button"
                  onClick={useManualInput}
                  className="px-4 py-3 rounded-xl text-sm font-semibold transition-opacity"
                  style={{ background: sourceMode === "manual" ? "#d45c29" : "rgba(255,255,255,0.04)", color: sourceMode === "manual" ? "#fff" : "#e8e3dc" }}
                >
                  Enter Manually
                </button>
              </div>

              {sourceInfo && (
                <p className="text-xs mt-3" style={{ color: "#8d8d86" }}>{sourceInfo}</p>
              )}

              {sourceMode === "database" && (
                <div className="mt-4 flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-xs" style={{ color: "#9a9a92" }}>
                    Values are loaded from recent heabo_reports entry.
                  </span>
                  <button
                    type="button"
                    onClick={() => setAllowEdit((v) => !v)}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{ color: "#f0ebe3", border: "1px solid rgba(255,255,255,0.14)" }}
                  >
                    {allowEdit ? "Lock Values" : "Edit Values"}
                  </button>
                </div>
              )}
            </div>

            {sourceMode && (
              <div>
                <div className="mt-4 grid gap-2.5" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                  <div>
                    <label className="block text-xs mb-1 tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace", color: "#3d3d39" }}>Sex</label>
                    <select value={inp.sex} onChange={(e) => setInp((p) => ({ ...p, sex: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all duration-200" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.04)", color: "#e8e3dc", fontFamily: "'Outfit', sans-serif" }}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="mt-2.5 grid gap-2.5" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                  {FIELDS.map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs mb-1 tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace", color: "#3d3d39" }}>
                        {f.label} <span style={{ color: "#2a2a26" }}>{f.unit}</span>
                      </label>
                      <input
                        type="number"
                        step={f.step}
                        min={f.min}
                        max={f.max}
                        value={inp[f.key]}
                        onChange={(e) => setInp((p) => ({ ...p, [f.key]: parseFloat(e.target.value) || p[f.key] }))}
                        disabled={!allowEdit && sourceMode === "database"}
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all duration-200"
                        style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.04)", color: "#e8e3dc", fontFamily: "'Outfit', sans-serif" }}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(212,92,41,0.45)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sourceError && (
              <div className="mt-4 text-sm rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.12)", color: "#fecaca", border: "1px solid rgba(239,68,68,0.35)" }}>
                {sourceError}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-14 pb-16">
          <button
            className="w-full py-4 rounded-2xl text-base font-semibold text-white flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #d45c29 0%, #b8481f 100%)", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.01em", boxShadow: "0 4px 24px rgba(212,92,41,0.25)" }}
            onClick={handleAnalyze}
            disabled={analyzing || !sourceMode}
          >
            {analyzing ? (<><span className="ph-spin">⟳</span> Analyzing biomarkers…</>) : "Analyze Biological Age & Disease Risk →"}
          </button>
        </div>

        {report && (
          <div ref={resultsRef} className="max-w-screen-xl mx-auto px-14 pb-24 ph-results">
            <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.05)", marginBottom: 56 }} />

            {ageOutput && (
              <div className="rounded-2xl p-5 mb-8" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="text-xs uppercase tracking-widest mb-3" style={{ fontFamily: "'DM Mono', monospace", color: "#d45c29" }}>AGE.py Output</div>
                <pre className="text-sm whitespace-pre-wrap" style={{ color: "#e8e3dc", fontFamily: "'DM Mono', monospace" }}>{ageOutput}</pre>
              </div>
            )}

            <div className="flex items-center gap-3.5 mb-5 text-xs uppercase tracking-widest ph-section-label" style={{ fontFamily: "'DM Mono', monospace", color: "#d45c29" }}>Summary</div>
            <div className="grid grid-cols-4 gap-4 mb-14">
              {[
                { label: "Chronological Age", value: `${report.age}`, sub: "years old", color: "#e8e3dc" },
                { label: "Biological Age", value: `${report.pheno_age}`, sub: "phenotypic years", color: gc },
                { label: "Age Gap", value: `${report.gap > 0 ? "+" : ""}${report.gap}`, sub: null, color: gc, aging: report.aging },
                { label: "Health Score", value: `${report.health}`, sub: "out of 100", color: hc },
              ].map((m, i) => (
                <div key={i} className="rounded-2xl px-6 py-7" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xs mb-3 tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace", color: "#3d3d39" }}>{m.label}</div>
                  <div className="text-5xl font-bold mb-2 leading-none" style={{ fontFamily: "'DM Mono', monospace", color: m.color }}>{m.value}</div>
                  {m.sub && <div className="text-xs" style={{ color: "#3d3d39" }}>{m.sub}</div>}
                  {m.aging && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mt-2" style={{ fontFamily: "'DM Mono', monospace", background: report.gap > 5 ? "rgba(239,68,68,0.1)" : report.gap < -5 ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)", color: gc }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: gc }} />
                      {m.aging}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3.5 mb-5 text-xs uppercase tracking-widest ph-section-label" style={{ fontFamily: "'DM Mono', monospace", color: "#d45c29" }}>Biomarkers & Disease Risks</div>
            <div className="grid gap-5 mb-14" style={{ gridTemplateColumns: "400px 1fr" }}>
              <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {report.bios.map((b, i) => {
                  const cfg = BIO_CFG[b.status];
                  return (
                    <div key={i} className="flex items-center gap-3 py-2.5" style={{ borderBottom: i < report.bios.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <div className="text-sm w-28 flex-shrink-0" style={{ color: "#a0a09a" }}>{b.name}</div>
                      <div className="text-xs w-16 flex-shrink-0 text-right" style={{ fontFamily: "'DM Mono', monospace", color: cfg.color }}>{b.value}</div>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <div className="h-full rounded-full" style={{ width: `${barW[b.name] || 0}%`, background: cfg.bar, transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 tracking-wide" style={{ fontFamily: "'DM Mono', monospace", background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {report.diseases.map((d, i) => <DiseaseCard key={i} d={d} idx={i} visible={!!report} />)}
              </div>
            </div>

            <div className="flex items-center gap-3.5 mb-5 text-xs uppercase tracking-widest ph-section-label" style={{ fontFamily: "'DM Mono', monospace", color: "#d45c29" }}>Priority Actions</div>
            <div className="grid grid-cols-3 gap-3">
              {report.allRecs.map((r, i) => (
                <div key={i} className="rounded-2xl px-5 py-5 flex gap-3.5 items-start" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ fontFamily: "'DM Mono', monospace", background: "rgba(212,92,41,0.12)", border: "1px solid rgba(212,92,41,0.22)", color: "#d45c29" }}>{i + 1}</div>
                  <div className="text-sm leading-relaxed" style={{ color: "#6b6b64" }}>{r}</div>
                </div>
              ))}
            </div>

            <div className="text-center text-xs mt-14" style={{ color: "#2a2a26" }}>⚠ For informational purposes only — not a medical diagnosis. Always consult a licensed physician.</div>
          </div>
        )}
      </div>
    </>
  );
}