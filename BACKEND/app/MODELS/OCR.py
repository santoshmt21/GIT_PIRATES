# ============================================================
# UNIVERSAL LAB OCR — VS CODE VERSION (LOCAL FILE)
# ============================================================

import re
import cv2
import numpy as np
from PIL import Image
import pytesseract

# 🔴 SET TESSERACT PATH (ONLY if not added to system PATH)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# ─── YOUR 10 TARGET FIELDS ──────────────────────────────────
FIELDS = {
    "age": [
        r"age\s*:\s*(\d+)",
        r"age\s+(\d+)\s*years?",
    ],
    "albumin": [
        r"albumin[^\n]{0,30}?(\d+\.?\d*)\s*g/dl",
        r"albumin\s+(\d+\.?\d*)",
    ],
    "creatinine": [
        r"creatinine[^\n]{0,30}?(\d+\.?\d*)\s*mg/dl",
        r"creatinine\s+(\d+\.?\d*)",
    ],
    "glucose_mgdl": [
        r"glucose[^\n]{0,30}?(\d+\.?\d*)\s*mg/dl",
        r"glucose\s+(\d+\.?\d*)",
    ],
    "crp": [
        r"c[\s-]?reactive[^\n]{0,30}?(\d+\.?\d*)",
        r"\bcrp\b[^\n]{0,20}?(\d+\.?\d*)",
    ],
    "lymphocyte_percent": [
        r"lymphocytes?[^\n]{0,30}?(\d+\.?\d*)\s*(?:normal|low|high|%)",
        r"lymphocytes?\s+(\d+\.?\d*)",
    ],
    "mean_cell_volume": [
        r"mean\s*corpuscular\s*volume[^\n]{0,30}?(\d+\.?\d*)",
        r"\bmcv\b[^\n]{0,20}?(\d+\.?\d*)",
    ],
    "red_cell_dist_width": [
        r"rdw[^\n]{0,20}?(\d+\.?\d*)\s*(?:normal|low|high|%)",
        r"rdw\s+(\d+\.?\d*)",
        r"red\s*cell\s*dist[^\n]{0,30}?(\d+\.?\d*)",
    ],
    "alkaline_phosphatase": [
        r"alkaline\s*phosphatase[^\n]{0,30}?(\d+\.?\d*)",
        r"\balp\b[^\n]{0,20}?(\d+\.?\d*)",
    ],
    "white_blood_cell_count": [
        r"total\s*wbc[^\n]{0,30}?(\d{3,6})",
        r"\bwbc\b[^\n]{0,20}?(\d{3,6})",
        r"white\s*blood\s*cell[^\n]{0,30}?(\d+\.?\d*)",
    ],
}

# ─── PREPROCESSING MODES ────────────────────────────────────
def preprocess_scanned(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.resize(gray, None, fx=2.5, fy=2.5, interpolation=cv2.INTER_CUBIC)
    gray = cv2.bilateralFilter(gray, 9, 75, 75)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return thresh

def preprocess_digital(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.resize(gray, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)
    _, thresh = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY)
    return thresh

def detect_report_type(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    variance = cv2.Laplacian(gray, cv2.CV_64F).var()
    return "scanned" if variance > 500 else "digital"

# ─── OCR FUNCTION ───────────────────────────────────────────
def run_ocr(image_path):
    img = cv2.imread(image_path)
    if img is None:
        pil = Image.open(image_path).convert("RGB")
        img = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)

    report_type = detect_report_type(img)
    print(f"📋 Detected report type: {report_type}")

    texts = []

    # Try both preprocessing modes
    for mode_fn in [preprocess_digital, preprocess_scanned]:
        processed = mode_fn(img)
        text = pytesseract.image_to_string(
            Image.fromarray(processed),
            config="--oem 3 --psm 6"
        )
        texts.append(text)

    # Raw image OCR
    pil_img = Image.open(image_path).convert("RGB")
    texts.append(pytesseract.image_to_string(pil_img, config="--oem 3 --psm 4"))

    return "\n".join(texts)


def extract_values(text):
    """Return extracted numeric fields from OCR text without printing."""
    text_lower = text.lower()
    results = {}

    for field, patterns in FIELDS.items():
        for pat in patterns:
            m = re.search(pat, text_lower)
            if m:
                results[field] = float(m.group(1))
                break

    return results

# ─── EXTRACTION FUNCTION ─────────────────────────────────────
def extract_and_print(text):
    print("\n" + "═" * 50)
    print("         EXTRACTED VALUES")
    print("═" * 50)

    results = extract_values(text)

    for field in FIELDS.keys():
        if field in results:
            print(f"✅ {field:<30} {results[field]}")
        else:
            print(f"❌ {field:<30} not found")

    print("═" * 50)
    return results

# ─── MAIN RUN ────────────────────────────────────────────────
if __name__ == "__main__":
    image_path = r"C:\Users\Santosh\Downloads\CMP.webp"   # 👈 CHANGE THIS

    print(f"\n📄 Processing: {image_path}")

    text = run_ocr(image_path)

    # Debug OCR output if needed
    # print(text[:2000])

    results = extract_and_print(text)

    print("\n✅ Final dict:", results)