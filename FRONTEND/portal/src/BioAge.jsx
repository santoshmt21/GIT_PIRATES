import { useState, useRef, useEffect } from "react";
import DashboardSidebar from './DashboardSidebar.jsx';

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

const BIOMARKER_REF_MAP = {
  Albumin: "albumin",
  Creatinine: "creatinine",
  Glucose: "glucose",
  CRP: "crp",
  "Lymphocyte %": "lymphocyte_pct",
  MCV: "mcv",
  RDW: "rdw",
  ALP: "alp",
  WBC: "wbc",
};

const DISEASE_ICON_MAP = {
  "Cardiovascular Disease": "❤",
  "Type 2 Diabetes": "◈",
  "Chronic Kidney Disease": "⬡",
  "Liver Disease": "◉",
  "Cancer / Immune Risk": "◎",
  "Metabolic Syndrome": "⬢",
};

const DEFAULT_FIELD_TO_BIOMARKER = {
  albumin: "Albumin",
  creatinine: "Creatinine",
  glucose_mgdl: "Glucose",
  crp: "CRP",
  lymphocyte_percent: "Lymphocyte %",
  mean_cell_volume: "MCV",
  red_cell_dist_width: "RDW",
  alkaline_phosphatase: "ALP",
  white_blood_cell_count: "WBC",
};

const RISK_LEVEL_UI = {
  Low: { label: "Low Risk", color: "#166534", bg: "rgba(22,101,52,0.15)", bar: "#22c55e", dot: "#16a34a" },
  Moderate: { label: "Moderate Risk", color: "#92400e", bg: "rgba(146,64,14,0.15)", bar: "#f59e0b", dot: "#d97706" },
  High: { label: "High Risk", color: "#9a3412", bg: "rgba(154,52,18,0.15)", bar: "#f97316", dot: "#ea580c" },
  "Very High": { label: "Very High", color: "#7f1d1d", bg: "rgba(127,29,19,0.18)", bar: "#ef4444", dot: "#dc2626" },
};

function getBiomarkerRef(name, sex) {
  const key = BIOMARKER_REF_MAP[name];
  if (!key) return null;
  if (key === "creatinine") {
    return sex === "female" ? REF.creatinine_f : REF.creatinine_m;
  }
  return REF[key] || null;
}

function mapBackendRiskToUi(riskData, sex, dbMissingNames = []) {
  const biomarkerStatuses = Array.isArray(riskData?.biomarker_statuses) ? riskData.biomarker_statuses : [];
  const diseaseRisks = Array.isArray(riskData?.disease_risks) ? riskData.disease_risks : [];
  const defaultsUsedRaw = Array.isArray(riskData?.defaults_used) ? riskData.defaults_used : [];

  const defaultValueByName = {};
  defaultsUsedRaw.forEach((item) => {
    const name = DEFAULT_FIELD_TO_BIOMARKER[item.field];
    if (!name) return;
    defaultValueByName[name] = {
      value: Number(item.value),
      unit: item.unit || "",
    };
  });

  const bios = biomarkerStatuses.map((b) => {
    const ref = getBiomarkerRef(b.name, sex);
    const fillPct = ref
      ? Math.min(100, Math.max(5, ((Number(b.value) - ref.low * 0.5) / (ref.high * 1.5 - ref.low * 0.5)) * 100))
      : 50;
    return {
      name: b.name,
      value: Number(b.value),
      unit: b.unit,
      status: b.status,
      deviation: Number(b.deviation ?? 0),
      fillPct,
      usedDefault: Boolean(b.used_default) || Boolean(defaultValueByName[b.name]) || dbMissingNames.includes(b.name),
      defaultValue: defaultValueByName[b.name] || null,
    };
  });

  const diseases = diseaseRisks.map((d) => {
    const level = RISK_LEVEL_UI[d.risk_level] || RISK_LEVEL_UI.Moderate;
    return {
      name: d.name,
      icon: DISEASE_ICON_MAP[d.name] || "•",
      score: Number(d.risk_score ?? 0),
      level,
      factors: Array.isArray(d.contributing_factors) ? d.contributing_factors : [],
      recs: Array.isArray(d.recommendations) ? d.recommendations : [],
    };
  });

  return {
    bios,
    diseases,
    gap: Number(riskData.age_gap ?? 0),
    aging:
      riskData.aging_status === "Accelerated"
        ? "Accelerated Aging"
        : riskData.aging_status === "Decelerated"
        ? "Decelerated Aging"
        : "Normal Aging",
    health: Number(riskData.overall_health_score ?? 0),
    pheno_age: Number(riskData.pheno_age ?? 0),
    age: Number(riskData.chrono_age ?? 0),
    allRecs: Array.isArray(riskData.top_priority_actions) ? riskData.top_priority_actions : [],
  };
}

function buildHealthSummary(report) {
  if (!report) return "";

  const topRisks = [...(report.diseases || [])]
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  const abnormalBiomarkers = (report.bios || [])
    .filter((b) => b.status !== "normal")
    .sort((a, b) => (b.deviation || 0) - (a.deviation || 0));

  const ageLine = `Biological age is ${report.pheno_age} years versus chronological age ${report.age}, with an age gap of ${report.gap > 0 ? "+" : ""}${report.gap}.`;

  const healthBand = report.health >= 70 ? "good" : report.health >= 45 ? "moderate" : "low";
  const healthLine = `Overall health score is ${report.health}/100, which indicates a ${healthBand} current health profile.`;

  const riskLine =
    topRisks.length > 0
      ? `Highest risk signals are ${topRisks.map((r) => `${r.name} (${r.score}%)`).join(" and ")}.`
      : "No major disease risk peaks detected in the current profile.";

  const biomarkerLine =
    abnormalBiomarkers.length > 0
      ? `Most deviated biomarkers are ${abnormalBiomarkers.slice(0, 3).map((b) => `${b.name} (${b.status.replace("_", " ")})`).join(", ")}.`
      : "Most biomarkers are within expected reference ranges.";

  const actionLine = report.allRecs?.[0]
    ? `Priority action: ${report.allRecs[0]}.`
    : "Maintain regular follow-up and repeat labs to track trends over time.";

  const prognosisLine = report.health >= 70
    ? "Overall prediction suggests stable risk control if current habits are maintained with periodic lab follow-up."
    : report.health >= 45
      ? "Prediction indicates moderate progression risk, so focused lifestyle correction and repeat testing in the near term are recommended."
      : "Prediction indicates elevated near-term risk progression, so early clinical consultation and aggressive risk-factor management are strongly advised.";

  return [ageLine, healthLine, riskLine, biomarkerLine, actionLine, prognosisLine].slice(0, 6).join(" ");
}

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
      className="rounded-2xl p-6 min-h-[196px] cursor-pointer transition-all duration-200"
      style={{ background: "#eaf1f8", border: open ? "1px solid rgba(2,132,199,0.65)" : "1px solid #94a3b8", boxShadow: "0 10px 24px rgba(15,23,42,0.12)" }}
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex justify-between items-start mb-2.5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base" style={{ background: d.level.bg }}>{d.icon}</div>
        <span className="text-3xl font-bold" style={{ fontFamily: "'DM Mono', monospace", color: d.level.dot }}>{d.score}%</span>
      </div>

      <div className="text-lg font-semibold mb-0.5" style={{ color: "#0f172a" }}>{d.name}</div>
      <div className="text-base font-bold mb-2.5 tracking-wide" style={{ fontFamily: "'DM Mono', monospace", color: d.level.dot }}>{d.level.label}</div>

      <div className="h-2 rounded-full overflow-hidden" style={{ background: "#94a3b8" }}>
        <div className="h-full rounded-full" style={{ width: `${bw}%`, background: d.level.bar, transition: "width 1.1s cubic-bezier(.4,0,.2,1)" }} />
      </div>

      {open && (
        <div className="mt-3.5 pt-3" style={{ borderTop: "1px solid #e2e8f0" }}>
          {d.factors.length > 0 && (
            <>
              <div className="text-sm mb-1.5 tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace", color: "#475569" }}>Factors</div>
              {d.factors.map((f, i) => (
                <div key={i} className="flex gap-1.5 text-sm mb-1 leading-relaxed" style={{ color: "#1e293b" }}>
                  <span style={{ color: d.level.dot, flexShrink: 0 }}>▸</span>{f}
                </div>
              ))}
            </>
          )}
          <div className="text-sm mb-1.5 tracking-widest uppercase mt-2.5" style={{ fontFamily: "'DM Mono', monospace", color: "#475569" }}>Recommendations</div>
          {d.recs.map((r, i) => (
            <div key={i} className="flex gap-1.5 text-sm mb-1 leading-relaxed" style={{ color: "#334155" }}>
              <span style={{ color: "#0284c7", flexShrink: 0 }}>→</span>{r}
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
  const [dbMissingNames, setDbMissingNames] = useState([]);
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

      const rawToBioName = {
        albumin: "Albumin",
        creatinine: "Creatinine",
        glucose_mgdl: "Glucose",
        crp: "CRP",
        lymphocyte_percent: "Lymphocyte %",
        mean_cell_volume: "MCV",
        red_cell_dist_width: "RDW",
        alkaline_phosphatase: "ALP",
        wbc_for_age: "WBC",
      };
      const missingFromDb = Object.entries(rawToBioName)
        .filter(([rawKey]) => data.data[rawKey] === null || data.data[rawKey] === undefined)
        .map(([, bioName]) => bioName);
      setDbMissingNames(missingFromDb);

      setInp((prev) => ({
        ...prev,
        age: data.data.age ?? prev.age,
        albumin: data.data.albumin ?? null,
        creatinine: data.data.creatinine ?? null,
        glucose: data.data.glucose_mgdl ?? null,
        crp: data.data.crp ?? null,
        lymphocyte_pct: data.data.lymphocyte_percent ?? null,
        mcv: data.data.mean_cell_volume ?? null,
        rdw: data.data.red_cell_dist_width ?? null,
        alp: data.data.alkaline_phosphatase ?? null,
        wbc: data.data.wbc_for_age ?? null,
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
    setDbMissingNames([]);
  };

  const handleAnalyze = async () => {
    if (!sourceMode) {
      setSourceError("Select a source first: Database or Manual.");
      return;
    }

    const userEmail = localStorage.getItem("userEmail") || "";
    if (!userEmail) {
      setSourceError("User email not found. Please log in again.");
      return;
    }
    if (inp.age === null || inp.age === "" || Number.isNaN(Number(inp.age))) {
      setSourceError("Age is required for analysis.");
      return;
    }

    setAnalyzing(true);
    setSourceError("");
    setReport(null);
    setAgeOutput("");

    try {
      const payload = {
        user_email: userEmail,
        age: Number(inp.age),
        albumin: inp.albumin === null || inp.albumin === "" ? null : Number(inp.albumin),
        creatinine: inp.creatinine === null || inp.creatinine === "" ? null : Number(inp.creatinine),
        glucose_mgdl: inp.glucose === null || inp.glucose === "" ? null : Number(inp.glucose),
        crp: inp.crp === null || inp.crp === "" ? null : Number(inp.crp),
        lymphocyte_percent: inp.lymphocyte_pct === null || inp.lymphocyte_pct === "" ? null : Number(inp.lymphocyte_pct),
        mean_cell_volume: inp.mcv === null || inp.mcv === "" ? null : Number(inp.mcv),
        red_cell_dist_width: inp.rdw === null || inp.rdw === "" ? null : Number(inp.rdw),
        alkaline_phosphatase: inp.alp === null || inp.alp === "" ? null : Number(inp.alp),
        white_blood_cell_count: inp.wbc === null || inp.wbc === "" ? null : Number(inp.wbc),
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
      setAgeOutput(data.data.formatted_output || "");
      const effective = data.data.effective_biomarkers || {};

      const riskPayload = {
        age: Number(inp.age),
        albumin: Number(effective.albumin ?? inp.albumin),
        creatinine: Number(effective.creatinine ?? inp.creatinine),
        glucose_mgdl: Number(effective.glucose_mgdl ?? inp.glucose),
        crp: Number(effective.crp ?? inp.crp),
        lymphocyte_percent: Number(effective.lymphocyte_percent ?? inp.lymphocyte_pct),
        mean_cell_volume: Number(effective.mean_cell_volume ?? inp.mcv),
        red_cell_dist_width: Number(effective.red_cell_dist_width ?? inp.rdw),
        alkaline_phosphatase: Number(effective.alkaline_phosphatase ?? inp.alp),
        white_blood_cell_count: Number(effective.white_blood_cell_count ?? inp.wbc),
        sex: inp.sex,
        biological_age: backendBioAge,
      };

      const riskResponse = await fetch("http://127.0.0.1:8000/reports/heabo-reports/analyze-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(riskPayload),
      });

      const riskData = await riskResponse.json();
      if (!riskResponse.ok || !riskData?.success) {
        throw new Error(riskData?.detail || riskData?.message || "Risk analysis failed");
      }

      const r = mapBackendRiskToUi(riskData.data, inp.sex, sourceMode === "database" ? dbMissingNames : []);
      setReport(r);

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
  const healthSummaryText = report ? buildHealthSummary(report) : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');
        html, body, #root { background: #eff6ff; margin: 0; padding: 0; width: 100%; }
        body { font-family: 'Outfit', sans-serif; }
        @keyframes phSlideUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
        @keyframes phSpin { to { transform: rotate(360deg); } }
        .ph-results { animation: phSlideUp 0.55s ease both; }
        .ph-spin { display: inline-block; animation: phSpin 0.9s linear infinite; font-size: 18px; }
        .ph-section-label::after { content: ''; flex: 1; height: 1px; background: #cbd5e1; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
        select option { background: #ffffff; color: #0f172a; }
      `}</style>

      <div className="min-h-screen w-full pl-36" style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #ecfeff 45%, #eff6ff 100%)", color: "#0f172a", fontFamily: "'Outfit', sans-serif" }}>
        <DashboardSidebar activePath="/bioage" />
        <nav className="sticky top-0 z-50 h-16 px-16 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid #dbeafe" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full" style={{ background: "#0284c7" }} />
            <span className="text-lg font-semibold tracking-tight" style={{ color: "#0f172a" }}>BioAge</span>
            <span className="mx-1" style={{ color: "#94a3b8" }}>/</span>
            <span className="text-sm" style={{ color: "#64748b" }}>Disease Risk Engine</span>
          </div>
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="text-sm px-3.5 py-2 rounded-full tracking-widest transition-colors hover:bg-white/5"
                style={{ fontFamily: "'DM Mono', monospace", color: "#0f172a", border: "1px solid #cbd5e1" }}
              >
                ← Back
              </button>
            )}
            <span className="text-sm px-3 py-1.5 rounded-full tracking-widest" style={{ fontFamily: "'DM Mono', monospace", color: "#0284c7", border: "1px solid rgba(14,165,233,0.35)", background: "rgba(14,165,233,0.07)" }}>v2.0 · BETA</span>
          </div>
        </nav>

        <div className="w-[90%] mx-auto px-16 pt-16 pb-12 grid gap-28 items-start" style={{ gridTemplateColumns: "1fr 620px" }}>
          <div>
            <div className="text-sm mb-5 tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace", color: "#0284c7" }}>Biological Age Analysis</div>
            <h1 className="text-7xl font-bold leading-tight mb-5" style={{ letterSpacing: "-0.035em", color: "#0f172a" }}>
              Predict your<br />
              <em className="not-italic" style={{ color: "#0284c7" }}>disease risk</em><br />
              from blood work
            </h1>
            <p className="text-lg leading-relaxed max-w-xl" style={{ color: "#475569" }}>
              Choose whether to use your latest biomarkers from database or enter values manually, then analyze biological age and disease risks.
            </p>
            <div className="flex gap-10 mt-11 pt-11" style={{ borderTop: "1px solid #cbd5e1" }}>
              {[["9", "Biomarkers analyzed"], ["6", "Disease risks scored"], ["100%", "Runs locally"]].map(([n, l]) => (
                <div key={l}>
                  <div className="text-4xl font-bold" style={{ fontFamily: "'DM Mono', monospace", color: "#0f172a" }}>{n}</div>
                  <div className="text-sm mt-1" style={{ color: "#64748b" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-2xl p-8" style={{ border: "1.5px dashed rgba(14,165,233,0.4)", background: "#ffffff" }}>
              <div className="text-lg uppercase tracking-widest mb-3" style={{ fontFamily: "'DM Mono', monospace", color: "#0284c7" }}>
                Marker Data Source
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <button
                  type="button"
                  onClick={loadFromDatabase}
                  disabled={loadingDb}
                  className="px-5 py-3.5 rounded-xl text-lg font-semibold transition-opacity disabled:opacity-60"
                  style={{ background: sourceMode === "database" ? "#0284c7" : "#f1f5f9", color: sourceMode === "database" ? "#fff" : "#0f172a" }}
                >
                  {loadingDb ? "Loading..." : "Use Latest From Database"}
                </button>
                <button
                  type="button"
                  onClick={useManualInput}
                  className="px-5 py-3.5 rounded-xl text-lg font-semibold transition-opacity"
                  style={{ background: sourceMode === "manual" ? "#0284c7" : "#f1f5f9", color: sourceMode === "manual" ? "#fff" : "#0f172a" }}
                >
                  Enter Manually
                </button>
              </div>

              {sourceInfo && (
                <p className="text-base mt-3" style={{ color: "#64748b" }}>{sourceInfo}</p>
              )}

              {sourceMode === "database" && (
                <div className="mt-4 flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <span className="text-base" style={{ color: "#64748b" }}>
                    Values are loaded from recent heabo_reports entry.
                  </span>
                  <button
                    type="button"
                    onClick={() => setAllowEdit((v) => !v)}
                    className="text-base px-3.5 py-1.5 rounded-full font-semibold"
                    style={{ color: "#0f172a", border: "1px solid #cbd5e1", background: "#ffffff" }}
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
                    <label className="block text-base font-semibold mb-1 tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace", color: "#475569" }}>Sex</label>
                    <select value={inp.sex} onChange={(e) => setInp((p) => ({ ...p, sex: e.target.value }))} className="w-full rounded-lg px-4 py-3 text-lg font-semibold outline-none transition-all duration-200" style={{ border: "1px solid #94a3b8", background: "#e2e8f0", color: "#0f172a", fontFamily: "'Outfit', sans-serif" }}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="mt-2.5 grid gap-2.5" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                  {FIELDS.map((f) => (
                    <div key={f.key}>
                      <label className="block text-base font-semibold mb-1 tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace", color: "#475569" }}>
                        {f.label} <span style={{ color: "#94a3b8" }}>{f.unit}</span>
                      </label>
                      <input
                        type="number"
                        step={f.step}
                        min={f.min}
                        max={f.max}
                        value={inp[f.key] ?? ""}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setInp((p) => ({
                            ...p,
                            [f.key]: raw === "" ? null : parseFloat(raw),
                          }));
                        }}
                        disabled={!allowEdit && sourceMode === "database"}
                        className="w-full rounded-lg px-4 py-3 text-lg font-semibold outline-none transition-all duration-200"
                        style={{ border: "1px solid #94a3b8", background: "#e2e8f0", color: "#0f172a", fontFamily: "'Outfit', sans-serif" }}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(14,165,233,0.55)")}
                        onBlur={(e) => (e.target.style.borderColor = "#94a3b8")}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sourceError && (
              <div className="mt-4 text-base rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.12)", color: "#fecaca", border: "1px solid rgba(239,68,68,0.35)" }}>
                {sourceError}
              </div>
            )}
          </div>
        </div>

        <div className="w-[90%] mx-auto px-16 pb-16">
          <button
            className="w-full py-5 rounded-2xl text-lg font-semibold text-white flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.01em", boxShadow: "0 4px 24px rgba(2,132,199,0.24)" }}
            onClick={handleAnalyze}
            disabled={analyzing || !sourceMode}
          >
            {analyzing ? (<><span className="ph-spin">⟳</span> Analyzing biomarkers…</>) : "Analyze Biological Age & Disease Risk →"}
          </button>
        </div>

        {report && (
          <div ref={resultsRef} className="w-[90%] mx-auto px-16 pb-24 ph-results">
            <hr style={{ border: "none", borderTop: "1px solid #cbd5e1", marginBottom: 56 }} />

            {ageOutput && (
              <div className="rounded-2xl p-5 mb-8" style={{ background: "#ffffff", border: "1px solid #dbeafe", boxShadow: "0 6px 18px rgba(2,132,199,0.08)" }}>
                <div className="text-lg uppercase tracking-widest mb-3" style={{ fontFamily: "'DM Mono', monospace", color: "#0284c7" }}>AGE.py Output</div>
                <pre className="text-xl whitespace-pre-wrap" style={{ color: "#0f172a", fontFamily: "'DM Mono', monospace", lineHeight: "1.85" }}>{ageOutput}</pre>
              </div>
            )}

            <div className="flex items-center gap-3.5 mb-5 text-base uppercase tracking-widest ph-section-label" style={{ fontFamily: "'DM Mono', monospace", color: "#0284c7" }}>Summary</div>
            <div className="grid grid-cols-4 gap-4 mb-14">
              {[
                { label: "Chronological Age", value: `${report.age}`, sub: "years old", color: "#0f172a" },
                { label: "Biological Age", value: `${report.pheno_age}`, sub: "phenotypic years", color: gc },
                { label: "Age Gap", value: `${report.gap > 0 ? "+" : ""}${report.gap}`, sub: null, color: gc, aging: report.aging },
                { label: "Health Score", value: `${report.health}`, sub: "out of 100", color: hc },
              ].map((m, i) => (
                <div
                  key={i}
                  className="rounded-2xl px-6 py-7"
                  style={{
                    background: m.label === "Biological Age" ? "linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)" : "#ffffff",
                    border: m.label === "Biological Age" ? "2px solid rgba(14,165,233,0.55)" : "1px solid #dbeafe",
                    boxShadow: m.label === "Biological Age" ? "0 10px 26px rgba(2,132,199,0.2)" : "0 6px 18px rgba(2,132,199,0.08)",
                    transform: m.label === "Biological Age" ? "translateY(-3px)" : "none",
                  }}
                >
                  <div className="text-sm mb-3 tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace", color: m.label === "Biological Age" ? "#0369a1" : "#64748b" }}>{m.label}</div>
                  <div className="text-6xl font-bold mb-2 leading-none" style={{ fontFamily: "'DM Mono', monospace", color: m.color }}>{m.value}</div>
                  {m.sub && <div className="text-sm" style={{ color: "#64748b" }}>{m.sub}</div>}
                  {m.aging && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mt-2" style={{ fontFamily: "'DM Mono', monospace", background: report.gap > 5 ? "rgba(239,68,68,0.1)" : report.gap < -5 ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)", color: gc }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: gc }} />
                      {m.aging}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3.5 mb-5 text-base uppercase tracking-widest ph-section-label" style={{ fontFamily: "'DM Mono', monospace", color: "#0284c7" }}>Biomarkers & Disease Risks</div>
            <div className="grid gap-5 mb-14" style={{ gridTemplateColumns: "680px 1fr" }}>
              <div className="rounded-2xl p-8" style={{ background: "#ffffff", border: "1px solid #dbeafe", boxShadow: "0 6px 18px rgba(2,132,199,0.08)" }}>
                {report.bios.map((b, i) => {
                  const cfg = BIO_CFG[b.status];
                  return (
                    <div key={i} className="flex items-center gap-4 py-3" style={{ borderBottom: i < report.bios.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                      {b.usedDefault && (
                        <span
                          className="text-base font-bold px-3 py-1.5 rounded-full flex-shrink-0 tracking-wide"
                          style={{ fontFamily: "'DM Mono', monospace", background: "rgba(2,132,199,0.14)", color: "#0284c7", border: "1px solid rgba(2,132,199,0.35)" }}
                          title="Value missing in source report"
                        >
                          MISSING
                        </span>
                      )}
                      <div className="text-lg w-32 flex-shrink-0" style={{ color: "#334155" }}>{b.name}</div>
                      <div className="text-base w-20 flex-shrink-0 text-right" style={{ fontFamily: "'DM Mono', monospace", color: cfg.color }}>{b.value}</div>
                      {b.usedDefault && b.defaultValue && (
                        <div
                          className="text-sm w-32 flex-shrink-0 text-right"
                          style={{ fontFamily: "'DM Mono', monospace", color: "#0284c7" }}
                          title="Auto-filled because original value was missing"
                        >
                          def {b.defaultValue.value}
                        </div>
                      )}
                      {b.usedDefault && !b.defaultValue && (
                        <div
                          className="text-sm w-32 flex-shrink-0 text-right"
                          style={{ fontFamily: "'DM Mono', monospace", color: "#0284c7" }}
                          title="Original value missing in database"
                        >
                          default
                        </div>
                      )}
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                        <div className="h-full rounded-full" style={{ width: `${barW[b.name] || 0}%`, background: cfg.bar, transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
                      </div>
                      <span className="text-base font-bold px-2.5 py-1 rounded-full flex-shrink-0 tracking-wide" style={{ fontFamily: "'DM Mono', monospace", background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {report.diseases.map((d, i) => <DiseaseCard key={i} d={d} idx={i} visible={!!report} />)}
              </div>
            </div>

            <div className="flex items-center gap-3.5 mb-5 text-base uppercase tracking-widest ph-section-label" style={{ fontFamily: "'DM Mono', monospace", color: "#0284c7" }}>Priority Actions</div>
            <div className="grid grid-cols-3 gap-3">
              {report.allRecs.map((r, i) => (
                <div key={i} className="rounded-2xl px-5 py-5 flex gap-3.5 items-start" style={{ background: "#ffffff", border: "1px solid #dbeafe", boxShadow: "0 6px 18px rgba(2,132,199,0.08)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ fontFamily: "'DM Mono', monospace", background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.22)", color: "#0284c7" }}>{i + 1}</div>
                  <div className="text-xl leading-relaxed" style={{ color: "#334155" }}>{r}</div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl px-6 py-6" style={{ background: "linear-gradient(135deg, #d6f0ff 0%, #d9f7f3 100%)", border: "1px solid #7dd3fc", boxShadow: "0 8px 20px rgba(14,165,233,0.14)" }}>
              <div className="text-lg uppercase tracking-widest mb-4" style={{ fontFamily: "'DM Mono', monospace", color: "#0369a1" }}>
                Health Summary
              </div>
              <p className="text-xl leading-10" style={{ color: "#0f172a" }}>
                {healthSummaryText}
              </p>
            </div>

            <div className="text-center text-sm mt-14" style={{ color: "#64748b" }}>For informational purposes only - not a medical diagnosis. Always consult a licensed physician.</div>
          </div>
        )}
      </div>
    </>
  );
}