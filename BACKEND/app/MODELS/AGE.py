import math

BIOMARKER_UNITS = {
    "albumin": "g/dL",
    "creatinine": "mg/dL",
    "glucose_mgdl": "mg/dL",
    "crp": "mg/L",
    "lymphocyte_percent": "%",
    "mean_cell_volume": "fL",
    "red_cell_dist_width": "%",
    "alkaline_phosphatase": "U/L",
    "white_blood_cell_count": "10^3/uL",
}


def _clamp(v, low, high):
    return max(low, min(high, v))


def _is_missing(v):
    return v is None or (isinstance(v, float) and math.isnan(v))


def get_age_based_defaults(age):
    """Return age-conditioned average defaults for all biomarkers (except age)."""
    a = float(age)
    return {
        "albumin": round(_clamp(4.4 - 0.004 * (a - 20), 3.5, 4.8), 2),
        "creatinine": round(_clamp(0.85 + 0.003 * (a - 40), 0.6, 1.2), 2),
        "glucose_mgdl": round(_clamp(85 + 0.4 * (a - 20), 75, 115), 1),
        "crp": round(_clamp(1.0 + 0.03 * (a - 20), 0.3, 5.0), 2),
        "lymphocyte_percent": round(_clamp(34 - 0.18 * (a - 20), 16, 40), 1),
        "mean_cell_volume": round(_clamp(88 + 0.06 * (a - 20), 80, 102), 1),
        "red_cell_dist_width": round(_clamp(12.6 + 0.03 * (a - 20), 11.5, 15.5), 1),
        "alkaline_phosphatase": round(_clamp(72 + 0.8 * (a - 20), 44, 160), 1),
        "white_blood_cell_count": round(_clamp(6.8 - 0.01 * (a - 20), 4.5, 9.5), 1),
    }


def impute_missing_biomarkers(age, biomarkers):
    """Fill missing biomarkers with age-based defaults.

    Returns: (filled_biomarkers, defaults_used)
    where defaults_used is a list of dicts: {field, value, unit}
    """
    defaults = get_age_based_defaults(age)
    filled = dict(biomarkers)
    defaults_used = []

    for field, default_value in defaults.items():
        if _is_missing(filled.get(field)):
            filled[field] = default_value
            defaults_used.append(
                {
                    "field": field,
                    "value": default_value,
                    "unit": BIOMARKER_UNITS.get(field, ""),
                }
            )

    return filled, defaults_used

def calculate_pheno_age(age, albumin, creatinine, glucose_mgdl, crp,
                        lymphocyte_percent, mean_cell_volume,
                        red_cell_dist_width, alkaline_phosphatase,
                        white_blood_cell_count):
    """Return biological age metrics from 9 biomarkers + chronological age."""
    biomarkers, defaults_used = impute_missing_biomarkers(
        age,
        {
            "albumin": albumin,
            "creatinine": creatinine,
            "glucose_mgdl": glucose_mgdl,
            "crp": crp,
            "lymphocyte_percent": lymphocyte_percent,
            "mean_cell_volume": mean_cell_volume,
            "red_cell_dist_width": red_cell_dist_width,
            "alkaline_phosphatase": alkaline_phosphatase,
            "white_blood_cell_count": white_blood_cell_count,
        },
    )

    albumin = float(biomarkers["albumin"])
    creatinine = float(biomarkers["creatinine"])
    glucose_mgdl = float(biomarkers["glucose_mgdl"])
    crp = float(biomarkers["crp"])
    lymphocyte_percent = float(biomarkers["lymphocyte_percent"])
    mean_cell_volume = float(biomarkers["mean_cell_volume"])
    red_cell_dist_width = float(biomarkers["red_cell_dist_width"])
    alkaline_phosphatase = float(biomarkers["alkaline_phosphatase"])
    white_blood_cell_count = float(biomarkers["white_blood_cell_count"])

    if crp <= 0:
        raise ValueError("CRP must be greater than 0 for log calculation")

    glucose = glucose_mgdl / 18.0182

    xb = (
        -19.907
        - 0.0336  * albumin
        + 0.0095  * creatinine
        + 0.1953  * glucose
        + 0.0954  * math.log(crp)
        - 0.0120  * lymphocyte_percent
        + 0.0268  * mean_cell_volume
        + 0.3306  * red_cell_dist_width
        + 0.00188 * alkaline_phosphatase
        + 0.0554  * white_blood_cell_count
        + 0.0804  * age
    )

    gamma = 0.0076927
    m = 1 - math.exp(-math.exp(xb) * (math.exp(120 * gamma) - 1) / gamma)
    m = max(0.000001, min(0.999999, m))

    biological_age = 141.50225 + math.log(-0.00553 * math.log(1 - m)) / 0.090165
    diff = biological_age - age

    if diff <= -10:  label = "Significantly younger — Excellent!"
    elif diff <= -5: label = "Younger than chronological age — Good."
    elif diff <= 2:  label = "Close to chronological age — Normal."
    elif diff <= 5:  label = "Slightly older — Consider lifestyle improvements."
    elif diff <= 10: label = "Older — Health improvements recommended."
    else:            label = "Significantly older — Consult a healthcare provider."

    return {
        "chronological_age": float(age),
        "biological_age": round(biological_age, 1),
        "age_difference": round(diff, 1),
        "mortality_score": round(m, 3),
        "interpretation": label,
        "defaults_used": defaults_used,
        "effective_biomarkers": biomarkers,
    }


def pheno_age(age, albumin, creatinine, glucose_mgdl, crp,
              lymphocyte_percent, mean_cell_volume,
              red_cell_dist_width, alkaline_phosphatase,
              white_blood_cell_count):
    """Compatibility wrapper that prints the computed summary."""
    result = calculate_pheno_age(
        age=age,
        albumin=albumin,
        creatinine=creatinine,
        glucose_mgdl=glucose_mgdl,
        crp=crp,
        lymphocyte_percent=lymphocyte_percent,
        mean_cell_volume=mean_cell_volume,
        red_cell_dist_width=red_cell_dist_width,
        alkaline_phosphatase=alkaline_phosphatase,
        white_blood_cell_count=white_blood_cell_count,
    )

    print(f"Chronological age : {result['chronological_age']} years")
    print(f"Biological age    : {result['biological_age']} years")
    print(f"Age difference    : {result['age_difference']:+} years")
    print(f"Mortality score   : {result['mortality_score']}")
    print(f"Interpretation    : {result['interpretation']}")


# ── Usage ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=== Case 1 ===")
    pheno_age(age=45, albumin=4.2, creatinine=0.9, glucose_mgdl=85,
              crp=0.5, lymphocyte_percent=30, mean_cell_volume=90,
              red_cell_dist_width=12.5, alkaline_phosphatase=70,
              white_blood_cell_count=6.0)

    print("\n=== Case 2 ===")
    pheno_age(age=22, albumin=4.5, creatinine=0.7, glucose_mgdl=80,
              crp=0.3, lymphocyte_percent=35, mean_cell_volume=89,
              red_cell_dist_width=14.0, alkaline_phosphatase=75,
              white_blood_cell_count=5.0)