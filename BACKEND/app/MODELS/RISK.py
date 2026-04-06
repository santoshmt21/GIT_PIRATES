"""
PheAge Disease Risk Predictor & Recommendation Engine
=====================================================
Standalone module — plug into any existing PheAge calculator.

Usage:
    from disease_risk_predictor import DiseaseRiskPredictor

    predictor = DiseaseRiskPredictor(
        age=45,
        albumin=4.0,          # g/dL
        creatinine=1.1,       # mg/dL
        glucose=95,           # mg/dL
        crp=2.5,              # mg/L
        lymphocyte_pct=28,    # %
        mcv=88,               # fL
        rdw=13.5,             # %
        alp=75,               # U/L
        wbc=6.5,              # 10^3/uL
        sex="male",           # "male" or "female"
        pheno_age=50.0        # Output from your PheAge model
    )

    result = predictor.predict()
    predictor.print_report(result)
"""

from dataclasses import dataclass, field
from typing import Optional
import math


# ─────────────────────────────────────────────
# Reference Ranges (Clinically Validated)
# ─────────────────────────────────────────────

REFERENCE_RANGES = {
    "albumin":        {"low": 3.5,  "high": 5.0,   "unit": "g/dL"},
    "creatinine_m":   {"low": 0.74, "high": 1.35,  "unit": "mg/dL"},
    "creatinine_f":   {"low": 0.59, "high": 1.04,  "unit": "mg/dL"},
    "glucose":        {"low": 70,   "high": 100,   "unit": "mg/dL"},
    "crp":            {"low": 0.0,  "high": 3.0,   "unit": "mg/L"},
    "lymphocyte_pct": {"low": 20,   "high": 40,    "unit": "%"},
    "mcv":            {"low": 80,   "high": 100,   "unit": "fL"},
    "rdw":            {"low": 11.5, "high": 14.5,  "unit": "%"},
    "alp":            {"low": 44,   "high": 147,   "unit": "U/L"},
    "wbc":            {"low": 4.5,  "high": 11.0,  "unit": "10³/µL"},
}


# ─────────────────────────────────────────────
# Data Classes
# ─────────────────────────────────────────────

@dataclass
class BiomarkerStatus:
    name: str
    value: float
    unit: str
    status: str        # "normal", "low", "high", "critical_low", "critical_high"
    deviation: float   # how far from normal range (0 = within range)


@dataclass
class DiseaseRisk:
    name: str
    risk_score: float       # 0–100
    risk_level: str         # "Low", "Moderate", "High", "Very High"
    risk_emoji: str
    contributing_factors: list[str]
    recommendations: list[str]


@dataclass
class PheAgeReport:
    chrono_age: int
    pheno_age: float
    age_gap: float                          # pheno_age - chrono_age
    aging_status: str                       # "Accelerated", "Normal", "Decelerated"
    biomarker_statuses: list[BiomarkerStatus]
    disease_risks: list[DiseaseRisk]
    top_priority_actions: list[str]
    overall_health_score: float             # 0–100


# ─────────────────────────────────────────────
# Main Predictor Class
# ─────────────────────────────────────────────

class DiseaseRiskPredictor:

    def __init__(
        self,
        age: int,
        albumin: float,
        creatinine: float,
        glucose: float,
        crp: float,
        lymphocyte_pct: float,
        mcv: float,
        rdw: float,
        alp: float,
        wbc: float,
        sex: str = "male",
        pheno_age: Optional[float] = None,
    ):
        self.age = age
        self.albumin = albumin
        self.creatinine = creatinine
        self.glucose = glucose
        self.crp = crp
        self.lymphocyte_pct = lymphocyte_pct
        self.mcv = mcv
        self.rdw = rdw
        self.alp = alp
        self.wbc = wbc
        self.sex = sex.lower()
        self.pheno_age = pheno_age if pheno_age is not None else float(age)

    # ── Biomarker Status ──────────────────────

    def _get_creatinine_ref(self):
        return REFERENCE_RANGES["creatinine_m"] if self.sex == "male" else REFERENCE_RANGES["creatinine_f"]

    def _classify(self, value, low, high):
        if value < low * 0.8:
            return "critical_low"
        elif value < low:
            return "low"
        elif value > high * 1.3:
            return "critical_high"
        elif value > high:
            return "high"
        return "normal"

    def _deviation(self, value, low, high):
        if value < low:
            return round((low - value) / low * 100, 1)
        elif value > high:
            return round((value - high) / high * 100, 1)
        return 0.0

    def _assess_biomarkers(self) -> list[BiomarkerStatus]:
        creat_ref = self._get_creatinine_ref()
        checks = [
            ("Albumin",           self.albumin,       REFERENCE_RANGES["albumin"]),
            ("Creatinine",        self.creatinine,    creat_ref),
            ("Glucose",           self.glucose,       REFERENCE_RANGES["glucose"]),
            ("CRP",               self.crp,           REFERENCE_RANGES["crp"]),
            ("Lymphocyte %",      self.lymphocyte_pct,REFERENCE_RANGES["lymphocyte_pct"]),
            ("MCV",               self.mcv,           REFERENCE_RANGES["mcv"]),
            ("RDW",               self.rdw,           REFERENCE_RANGES["rdw"]),
            ("ALP",               self.alp,           REFERENCE_RANGES["alp"]),
            ("WBC",               self.wbc,           REFERENCE_RANGES["wbc"]),
        ]
        statuses = []
        for name, value, ref in checks:
            status = self._classify(value, ref["low"], ref["high"])
            dev = self._deviation(value, ref["low"], ref["high"])
            statuses.append(BiomarkerStatus(name, value, ref["unit"], status, dev))
        return statuses

    # ── Risk Score Helpers ────────────────────

    def _score(self, conditions: list[tuple[bool, float]]) -> float:
        """Weighted scoring: list of (condition_met, weight) → 0–100 score."""
        total_weight = sum(w for _, w in conditions)
        earned = sum(w for cond, w in conditions if cond)
        return round((earned / total_weight) * 100, 1) if total_weight > 0 else 0.0

    def _risk_level(self, score: float) -> tuple[str, str]:
        if score < 25:
            return "Low", "🟢"
        elif score < 50:
            return "Moderate", "🟡"
        elif score < 75:
            return "High", "🔴"
        return "Very High", "🚨"

    # ── Disease Risk Calculations ─────────────

    def _cardiovascular_risk(self) -> DiseaseRisk:
        factors = []
        recommendations = []

        conditions = [
            (self.crp > 3.0,           25),
            (self.rdw > 14.5,          20),
            (self.creatinine > self._get_creatinine_ref()["high"], 15),
            (self.glucose > 100,       15),
            (self.albumin < 3.5,       10),
            (self.wbc > 10.0,          10),
            (self.age > 50,             5),
        ]
        score = self._score(conditions)

        if self.crp > 3.0:
            factors.append(f"Elevated CRP ({self.crp} mg/L) — systemic inflammation")
            recommendations.append("Reduce processed foods, sugar, and trans fats to lower inflammation")
            recommendations.append("Consider Omega-3 supplementation (fish oil 2g/day)")
        if self.rdw > 14.5:
            factors.append(f"High RDW ({self.rdw}%) — red cell size variability")
            recommendations.append("Get iron, B12, and folate levels checked")
        if self.glucose > 100:
            factors.append(f"Elevated glucose ({self.glucose} mg/dL) — metabolic stress")
            recommendations.append("Limit refined carbohydrates; walk 30 min after meals")
        if self.wbc > 10.0:
            factors.append(f"High WBC ({self.wbc}) — immune activation / inflammation")
        if not factors:
            factors.append("Biomarkers within normal cardiovascular range")
            recommendations.append("Maintain regular aerobic exercise (150 min/week)")

        level, emoji = self._risk_level(score)
        return DiseaseRisk("Cardiovascular Disease", score, level, emoji, factors, recommendations)

    def _diabetes_risk(self) -> DiseaseRisk:
        factors = []
        recommendations = []

        conditions = [
            (self.glucose > 125,       30),
            (self.glucose > 100,       20),
            (self.crp > 3.0,           20),
            (self.albumin < 3.8,       15),
            (self.age > 45,            10),
            (self.wbc > 9.0,            5),
        ]
        score = self._score(conditions)

        if self.glucose > 125:
            factors.append(f"Glucose {self.glucose} mg/dL — possible diabetic range")
            recommendations.append("Consult doctor immediately for HbA1c test")
            recommendations.append("Strict dietary sugar restriction required")
        elif self.glucose > 100:
            factors.append(f"Glucose {self.glucose} mg/dL — pre-diabetic range")
            recommendations.append("Get HbA1c test done to confirm prediabetes status")
            recommendations.append("Adopt low glycemic index diet; exercise regularly")
        if self.crp > 3.0:
            factors.append("Chronic inflammation accelerates insulin resistance")
            recommendations.append("Anti-inflammatory diet: turmeric, berries, leafy greens")
        if not factors:
            factors.append("Glucose and inflammation markers are in healthy range")
            recommendations.append("Maintain healthy weight and active lifestyle")

        level, emoji = self._risk_level(score)
        return DiseaseRisk("Type 2 Diabetes", score, level, emoji, factors, recommendations)

    def _kidney_risk(self) -> DiseaseRisk:
        factors = []
        recommendations = []
        creat_ref = self._get_creatinine_ref()

        conditions = [
            (self.creatinine > creat_ref["high"] * 1.3,  30),
            (self.creatinine > creat_ref["high"],         20),
            (self.albumin < 3.5,                          20),
            (self.glucose > 125,                          15),
            (self.wbc > 10.0,                             10),
            (self.age > 60,                                5),
        ]
        score = self._score(conditions)

        if self.creatinine > creat_ref["high"] * 1.3:
            factors.append(f"Critically high creatinine ({self.creatinine}) — kidney function impaired")
            recommendations.append("Urgent nephrology consultation recommended")
            recommendations.append("Avoid NSAIDs (ibuprofen); stay well hydrated")
        elif self.creatinine > creat_ref["high"]:
            factors.append(f"Elevated creatinine ({self.creatinine}) — reduced kidney filtration")
            recommendations.append("Increase water intake to 2.5–3L/day")
            recommendations.append("Reduce high-protein diet; avoid excessive salt")
        if self.albumin < 3.5:
            factors.append(f"Low albumin ({self.albumin} g/dL) — protein loss or poor synthesis")
            recommendations.append("Check for proteinuria (urine albumin test)")
        if not factors:
            factors.append("Kidney filtration markers appear normal")
            recommendations.append("Stay well hydrated; avoid frequent NSAID use")

        level, emoji = self._risk_level(score)
        return DiseaseRisk("Chronic Kidney Disease", score, level, emoji, factors, recommendations)

    def _liver_risk(self) -> DiseaseRisk:
        factors = []
        recommendations = []

        conditions = [
            (self.alp > 147 * 1.3,    30),
            (self.alp > 147,           20),
            (self.albumin < 3.5,       25),
            (self.mcv > 100,           15),
            (self.wbc > 10.0,          10),
        ]
        score = self._score(conditions)

        if self.alp > 147 * 1.3:
            factors.append(f"Critically high ALP ({self.alp} U/L) — liver or bile duct stress")
            recommendations.append("Consult gastroenterologist; get liver ultrasound")
            recommendations.append("Avoid alcohol completely")
        elif self.alp > 147:
            factors.append(f"Elevated ALP ({self.alp} U/L) — liver enzyme elevation")
            recommendations.append("Reduce alcohol and fatty food intake")
            recommendations.append("Get ALT/AST liver panel for full picture")
        if self.albumin < 3.5:
            factors.append(f"Low albumin ({self.albumin}) — liver may not synthesizing proteins well")
            recommendations.append("High-quality protein diet (eggs, legumes, lean meat)")
        if self.mcv > 100:
            factors.append(f"High MCV ({self.mcv} fL) — possible liver disease or alcohol effect")
            recommendations.append("Check B12, folate levels; reduce alcohol intake")
        if not factors:
            factors.append("Liver biomarkers are within healthy range")
            recommendations.append("Limit alcohol; maintain healthy BMI")

        level, emoji = self._risk_level(score)
        return DiseaseRisk("Liver Disease", score, level, emoji, factors, recommendations)

    def _immune_cancer_risk(self) -> DiseaseRisk:
        factors = []
        recommendations = []

        conditions = [
            (self.lymphocyte_pct < 20,  25),
            (self.rdw > 14.5,           25),
            (self.crp > 5.0,            20),
            (self.wbc > 11.0,           15),
            (self.albumin < 3.5,        10),
            (self.age > 55,              5),
        ]
        score = self._score(conditions)

        if self.lymphocyte_pct < 20:
            factors.append(f"Low lymphocyte % ({self.lymphocyte_pct}%) — weakened immune defense")
            recommendations.append("Consult doctor to rule out lymphopenia causes")
            recommendations.append("Support immunity: Vitamin D, Zinc, adequate sleep")
        if self.rdw > 14.5:
            factors.append(f"High RDW ({self.rdw}%) — cell stress marker elevated")
            recommendations.append("Investigate nutritional deficiencies (iron, B12, folate)")
        if self.crp > 5.0:
            factors.append(f"CRP {self.crp} mg/L — significant chronic inflammation")
            recommendations.append("Identify and treat source of inflammation")
        if self.wbc > 11.0:
            factors.append(f"High WBC ({self.wbc}) — possible infection or hematologic concern")
            recommendations.append("Repeat CBC in 4–6 weeks; consult hematologist if persistent")
        if not factors:
            factors.append("Immune markers appear within normal range")
            recommendations.append("Annual health checkup; maintain healthy lifestyle")

        level, emoji = self._risk_level(score)
        return DiseaseRisk("Cancer / Immune Risk", score, level, emoji, factors, recommendations)

    def _metabolic_syndrome_risk(self) -> DiseaseRisk:
        factors = []
        recommendations = []

        conditions = [
            (self.glucose > 100,        25),
            (self.crp > 3.0,            25),
            (self.albumin < 3.8,        20),
            (self.rdw > 14.0,           15),
            (self.age > 40,             15),
        ]
        score = self._score(conditions)

        if self.glucose > 100:
            factors.append(f"Elevated fasting glucose ({self.glucose}) — insulin resistance sign")
        if self.crp > 3.0:
            factors.append(f"High CRP ({self.crp}) — metabolic inflammation")
        if self.albumin < 3.8:
            factors.append(f"Low-normal albumin ({self.albumin}) — nutritional concern")

        recommendations.append("Mediterranean diet strongly recommended")
        recommendations.append("Target 150 min/week moderate aerobic activity")
        recommendations.append("Monitor waist circumference and BMI regularly")

        if not factors:
            factors.append("Metabolic markers are balanced")

        level, emoji = self._risk_level(score)
        return DiseaseRisk("Metabolic Syndrome", score, level, emoji, factors, recommendations)

    # ── Aging Status ──────────────────────────

    def _aging_status(self) -> tuple[str, float]:
        gap = round(self.pheno_age - self.age, 1)
        if gap > 5:
            status = "⚡ Accelerated Aging"
        elif gap < -5:
            status = "✅ Decelerated Aging (Younger than Chronological Age)"
        else:
            status = "⚖️ Normal Aging"
        return status, gap

    # ── Overall Health Score ──────────────────

    def _overall_health_score(self, disease_risks: list[DiseaseRisk], age_gap: float) -> float:
        avg_risk = sum(d.risk_score for d in disease_risks) / len(disease_risks)
        age_penalty = max(0, age_gap * 1.5)
        raw_score = 100 - avg_risk - age_penalty
        return round(max(0, min(100, raw_score)), 1)

    # ── Top Priority Actions ──────────────────

    def _top_priority_actions(self, disease_risks: list[DiseaseRisk]) -> list[str]:
        # Sort diseases by risk score descending
        sorted_risks = sorted(disease_risks, key=lambda x: x.risk_score, reverse=True)
        actions = []
        seen = set()
        for disease in sorted_risks:
            for rec in disease.recommendations:
                if rec not in seen and len(actions) < 6:
                    actions.append(rec)
                    seen.add(rec)
        return actions

    # ── Main Predict ──────────────────────────

    def predict(self) -> PheAgeReport:
        biomarker_statuses = self._assess_biomarkers()
        aging_status, age_gap = self._aging_status()

        disease_risks = [
            self._cardiovascular_risk(),
            self._diabetes_risk(),
            self._kidney_risk(),
            self._liver_risk(),
            self._immune_cancer_risk(),
            self._metabolic_syndrome_risk(),
        ]

        overall_score = self._overall_health_score(disease_risks, age_gap)
        top_actions = self._top_priority_actions(disease_risks)

        return PheAgeReport(
            chrono_age=self.age,
            pheno_age=self.pheno_age,
            age_gap=age_gap,
            aging_status=aging_status,
            biomarker_statuses=biomarker_statuses,
            disease_risks=disease_risks,
            top_priority_actions=top_actions,
            overall_health_score=overall_score,
        )

    # ── Print Report ──────────────────────────

    def print_report(self, report: PheAgeReport):
        print("\n" + "="*60)
        print("        🧬 PHENO AGE — HEALTH RISK REPORT")
        print("="*60)

        print(f"\n📅 Chronological Age : {report.chrono_age} years")
        print(f"🧬 Biological Age    : {report.pheno_age} years")
        print(f"📊 Age Gap           : {report.age_gap:+.1f} years")
        print(f"⏱️  Aging Status      : {report.aging_status}")
        print(f"💯 Overall Health    : {report.overall_health_score}/100")

        print("\n" + "-"*60)
        print("🩸 BIOMARKER STATUS")
        print("-"*60)
        for b in report.biomarker_statuses:
            icon = {"normal": "✅", "low": "🔽", "high": "🔼",
                    "critical_low": "🚨", "critical_high": "🚨"}.get(b.status, "❓")
            deviation_str = f"  ({b.deviation}% off)" if b.deviation > 0 else ""
            print(f"  {icon} {b.name:<22} {b.value} {b.unit}  [{b.status.upper()}]{deviation_str}")

        print("\n" + "-"*60)
        print("🔬 DISEASE RISK SCORES")
        print("-"*60)
        for d in report.disease_risks:
            bar = self._progress_bar(d.risk_score)
            print(f"\n  {d.risk_emoji} {d.name}")
            print(f"     Risk Score : {bar} {d.risk_score}% — {d.risk_level}")
            print(f"     Factors    :")
            for f in d.contributing_factors:
                print(f"       • {f}")
            print(f"     Advice     :")
            for r in d.recommendations:
                print(f"       → {r}")

        print("\n" + "-"*60)
        print("🎯 TOP PRIORITY ACTIONS")
        print("-"*60)
        for i, action in enumerate(report.top_priority_actions, 1):
            print(f"  {i}. {action}")

        print("\n" + "="*60)
        print("  ⚠️  This is not a medical diagnosis.")
        print("  Always consult a licensed physician.")
        print("="*60 + "\n")

    def _progress_bar(self, score: float, width: int = 20) -> str:
        filled = int(score / 100 * width)
        bar = "█" * filled + "░" * (width - filled)
        return f"[{bar}]"


# ─────────────────────────────────────────────
# Helper: get_risk_report() — easy one-liner
# ─────────────────────────────────────────────

def get_risk_report(
    age, albumin, creatinine, glucose, crp,
    lymphocyte_pct, mcv, rdw, alp, wbc,
    sex="male", pheno_age=None
) -> PheAgeReport:
    """
    Convenience wrapper — returns PheAgeReport directly.

    Example:
        report = get_risk_report(45, 4.0, 1.1, 95, 2.5, 28, 88, 13.5, 75, 6.5, "male", 50.0)
    """
    predictor = DiseaseRiskPredictor(
        age=age, albumin=albumin, creatinine=creatinine,
        glucose=glucose, crp=crp, lymphocyte_pct=lymphocyte_pct,
        mcv=mcv, rdw=rdw, alp=alp, wbc=wbc,
        sex=sex, pheno_age=pheno_age
    )
    return predictor.predict()


# ─────────────────────────────────────────────
# Demo / Test
# ─────────────────────────────────────────────

if __name__ == "__main__":

    # Example patient with some elevated markers
    predictor = DiseaseRiskPredictor(
        age=52,
        albumin=3.8,
        creatinine=1.3,
        glucose=108,
        crp=4.2,
        lymphocyte_pct=18,
        mcv=102,
        rdw=15.1,
        alp=160,
        wbc=10.5,
        sex="male",
        pheno_age=58.3      # From your PheAge model
    )

    report = predictor.predict()
    predictor.print_report(report)

    # Access programmatically
    print("\n--- Programmatic Access Example ---")
    for disease in report.disease_risks:
        print(f"{disease.name}: {disease.risk_score}% ({disease.risk_level})")
