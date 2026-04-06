import io
import os
import json
import tempfile
from dataclasses import asdict
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session
from datetime import date as dt_date
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

from app.database import get_db
from app import crud
from app.MODELS.OCR import run_ocr, extract_values
from app.MODELS.AGE import calculate_pheno_age
from app.MODELS.RISK import get_risk_report

router = APIRouter(prefix="/reports", tags=["Reports"])

SCOPES = ["https://www.googleapis.com/auth/drive"]

# Paths relative to the BACKEND directory (where uvicorn is run from)
CLIENT_SECRET_FILE = "client_secret.json.json"
TOKEN_FILE = "token.json"

def get_drive_service():
    """Returns an authenticated Google Drive service.
    On first run, opens a browser for OAuth consent and saves token.json.
    On subsequent runs, reuses/refreshes the saved token.
    """
    creds = None
    try:
        # Load saved token if it exists
        if os.path.exists(TOKEN_FILE):
            creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

        # If no valid creds, refresh or re-authenticate
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    CLIENT_SECRET_FILE, SCOPES
                )
                creds = flow.run_local_server(port=0)

            # Save token for future runs
            with open(TOKEN_FILE, "w") as token_file:
                token_file.write(creds.to_json())

        service = build("drive", "v3", credentials=creds)
        return service
    except Exception as e:
        print(f"Error authenticating with Google Drive: {e}")
        return None


def save_heabo_report(db: Session, user_email: str, extracted_values: dict):
    """Store OCR output in the heabo_reports table."""
    db.execute(
        text(
            """
            ALTER TABLE heabo_reports
            ALTER COLUMN white_blood_cell_count TYPE NUMERIC(8,2)
            USING white_blood_cell_count::NUMERIC
            """
        )
    )

    sql = text(
        """
        INSERT INTO heabo_reports (
            user_email,
            report_date,
            age,
            albumin,
            creatinine,
            glucose_mgdl,
            crp,
            lymphocyte_percent,
            mean_cell_volume,
            red_cell_dist_width,
            alkaline_phosphatase,
            white_blood_cell_count
        )
        VALUES (
            :user_email,
            :report_date,
            :age,
            :albumin,
            :creatinine,
            :glucose_mgdl,
            :crp,
            :lymphocyte_percent,
            :mean_cell_volume,
            :red_cell_dist_width,
            :alkaline_phosphatase,
            :white_blood_cell_count
        )
        RETURNING id
        """
    )

    params = {
        "user_email": user_email,
        "report_date": datetime.utcnow().date(),
        "age": extracted_values.get("age"),
        "albumin": extracted_values.get("albumin"),
        "creatinine": extracted_values.get("creatinine"),
        "glucose_mgdl": extracted_values.get("glucose_mgdl"),
        "crp": extracted_values.get("crp"),
        "lymphocyte_percent": extracted_values.get("lymphocyte_percent"),
        "mean_cell_volume": extracted_values.get("mean_cell_volume"),
        "red_cell_dist_width": extracted_values.get("red_cell_dist_width"),
        "alkaline_phosphatase": extracted_values.get("alkaline_phosphatase"),
        "white_blood_cell_count": extracted_values.get("white_blood_cell_count"),
    }

    inserted = db.execute(sql, params).scalar_one()
    db.commit()
    return inserted


def _normalize_wbc_for_age(value):
    if value is None:
        return None
    # OCR values are often absolute counts like 7000; Age model expects 10^3/uL like 7.0.
    return float(value) / 1000.0 if float(value) > 100 else float(value)


class BioAgeAnalyzeRequest(BaseModel):
    age: float
    albumin: float
    creatinine: float
    glucose_mgdl: float
    crp: float
    lymphocyte_percent: float
    mean_cell_volume: float
    red_cell_dist_width: float
    alkaline_phosphatase: float
    white_blood_cell_count: float


class BioRiskAnalyzeRequest(BaseModel):
    age: float
    albumin: float
    creatinine: float
    glucose_mgdl: float
    crp: float
    lymphocyte_percent: float
    mean_cell_volume: float
    red_cell_dist_width: float
    alkaline_phosphatase: float
    white_blood_cell_count: float
    sex: str = "male"
    biological_age: float


@router.get("/heabo-reports/latest")
def get_latest_heabo_report(user_email: str, db: Session = Depends(get_db)):
    sql = text(
        """
        SELECT
            id,
            user_email,
            report_date,
            age,
            albumin,
            creatinine,
            glucose_mgdl,
            crp,
            lymphocyte_percent,
            mean_cell_volume,
            red_cell_dist_width,
            alkaline_phosphatase,
            white_blood_cell_count
        FROM heabo_reports
        WHERE user_email = :user_email
        ORDER BY report_date DESC, id DESC
        LIMIT 1
        """
    )

    row = db.execute(sql, {"user_email": user_email}).mappings().first()

    if not row:
        return {
            "success": True,
            "message": "No heabo report found for this user",
            "data": None,
        }

    data = dict(row)
    data["wbc_for_age"] = _normalize_wbc_for_age(data.get("white_blood_cell_count"))
    return {
        "success": True,
        "message": "Latest heabo report fetched successfully",
        "data": data,
    }


@router.post("/heabo-reports/analyze-age")
def analyze_heabo_age(payload: BioAgeAnalyzeRequest):
    try:
        result = calculate_pheno_age(
            age=payload.age,
            albumin=payload.albumin,
            creatinine=payload.creatinine,
            glucose_mgdl=payload.glucose_mgdl,
            crp=payload.crp,
            lymphocyte_percent=payload.lymphocyte_percent,
            mean_cell_volume=payload.mean_cell_volume,
            red_cell_dist_width=payload.red_cell_dist_width,
            alkaline_phosphatase=payload.alkaline_phosphatase,
            white_blood_cell_count=_normalize_wbc_for_age(payload.white_blood_cell_count),
        )

        output_lines = [
            f"Chronological age : {result['chronological_age']} years",
            f"Biological age    : {result['biological_age']} years",
            f"Age difference    : {result['age_difference']:+} years",
            f"Mortality score   : {result['mortality_score']}",
            f"Interpretation    : {result['interpretation']}",
        ]

        return {
            "success": True,
            "message": "Age analysis completed",
            "data": {
                **result,
                "formatted_output": "\n".join(output_lines),
            },
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Age analysis failed: {str(e)}")


@router.post("/heabo-reports/analyze-risk")
def analyze_heabo_risk(payload: BioRiskAnalyzeRequest):
    try:
        risk_report = get_risk_report(
            age=int(round(payload.age)),
            albumin=float(payload.albumin),
            creatinine=float(payload.creatinine),
            glucose=float(payload.glucose_mgdl),
            crp=float(payload.crp),
            lymphocyte_pct=float(payload.lymphocyte_percent),
            mcv=float(payload.mean_cell_volume),
            rdw=float(payload.red_cell_dist_width),
            alp=float(payload.alkaline_phosphatase),
            wbc=float(payload.white_blood_cell_count),
            sex=payload.sex,
            pheno_age=float(payload.biological_age),
        )

        return {
            "success": True,
            "message": "Risk analysis completed",
            "data": asdict(risk_report),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk analysis failed: {str(e)}")


@router.post("/ocr-extract")
async def ocr_extract_report(
    file: UploadFile = File(...),
    user_email: str = Form(...),
    db: Session = Depends(get_db),
):
    """Run OCR.py on an uploaded report image and return extracted text + values."""
    allowed_types = {"image/png", "image/jpeg", "image/jpg", "image/webp", "image/bmp"}

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only image files are supported for OCR (PNG, JPG, JPEG, WEBP, BMP).",
        )

    suffix = os.path.splitext(file.filename or "")[1] or ".png"
    temp_path = None

    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(contents)
            temp_path = temp_file.name

        extracted_text = run_ocr(temp_path)
        extracted_values = extract_values(extracted_text)
        saved_id = save_heabo_report(db=db, user_email=user_email, extracted_values=extracted_values)

        return {
            "success": True,
            "message": "OCR completed successfully",
            "data": {
                "report_id": saved_id,
                "filename": file.filename,
                "content_type": file.content_type,
                "extracted_text": extracted_text,
                "extracted_values": extracted_values,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

@router.post("/resource_library")
async def upload_resource(
    title: str = Form(...),
    username: str = Form(...),  # Maps to user_gmail
    doctor_name: str = Form(...),
    hospital_name: str = Form(...),
    date: dt_date = Form(...),
    subject: str = Form(None), # Optional, keeping from original
    type: str = Form(None), # Optional, keeping from original
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    
    service = get_drive_service()
    if not service:
        raise HTTPException(status_code=500, detail="Google Drive authentication failed. Ensure client_secret.json is configured.")

    contents = await file.read()

    file_metadata = {
        "name": title,
        "parents": ["1UkRuPlzxH13QYYPolnvunS80qoKy2n08"]
    }

    media = MediaIoBaseUpload(
        io.BytesIO(contents),
        mimetype=file.content_type
    )

    try:
        uploaded = service.files().create(
            body=file_metadata,
            media_body=media,
            fields="id"
        ).execute()
        
        file_id = uploaded.get("id")
        drive_link = f"https://drive.google.com/file/d/{file_id}/view"

        # Create the dictionary to save to the database
        report_data = {
            "user_gmail": username,
            "report_title": title,
            "date": date,
            "drive_link": drive_link,
            "doctor_name": doctor_name,
            "hospital_name": hospital_name
        }

        # Save to database
        db_report = crud.create_report(db=db, report_data=report_data)

        return {
            "success": True,
            "message": "Resource uploaded and report created successfully",
            "data": {
                "report_id": db_report.id,
                "subject": subject,
                "title": title,
                "type": type,
                "username": username,
                "drive_link": drive_link,
                "doctor_name": doctor_name,
                "hospital_name": hospital_name,
                "date": date
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload to Drive or save to database: {str(e)}")


@router.get("/")
def get_user_reports(gmail: str, db: Session = Depends(get_db)):
    reports = crud.get_reports_by_gmail(db, gmail=gmail)
    
    return {
        "success": True,
        "message": "Reports fetched successfully",
        "data": reports
    }


@router.get("/heart-rate-reports")
def get_heart_rate_reports(gmail: str, db: Session = Depends(get_db)):
    """Fetch heart rate reports for a user."""
    try:
        reports = crud.get_heart_rate_reports(db, user_email=gmail)
        
        # Format the response
        data = [
            {
                "id": report.id,
                "user_email": report.user_email,
                "record_date": str(report.record_date),
                "heart_rate": report.heart_rate
            }
            for report in reports
        ]
        
        return {
            "success": True,
            "message": "Heart rate reports fetched successfully",
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch heart rate reports: {str(e)}")

@router.get("/blood-pressure-reports")
def get_blood_pressure_reports(gmail: str, db: Session = Depends(get_db)):
    """Fetch blood pressure reports for a user."""
    try:
        reports = crud.get_blood_pressure_reports(db, user_email=gmail)
        
        # Format the response
        data = [
            {
                "id": report.id,
                "user_email": report.user_email,
                "bp_date": str(report.bp_date),
                "systolic": report.systolic,
                "diastolic": report.diastolic
            }
            for report in reports
        ]
        
        return {
            "success": True,
            "message": "Blood pressure reports fetched successfully",
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch blood pressure reports: {str(e)}")

from typing import Optional

@router.get("/cbc-report")
def get_cbc_report(gmail: Optional[str] = None, userEmail: Optional[str] = None, db: Session = Depends(get_db)):
    """Fetch latest CBC report for a user."""
    try:
        user_email = gmail or userEmail
        if not user_email:
            raise HTTPException(status_code=400, detail="Missing user email for CBC report")

        report = crud.get_latest_cbc_report(db, user_email=user_email)

        if not report:
            return {
                "success": True,
                "message": "No CBC report found",
                "data": None
            }

        data = {
            "id": report.id,
            "user_email": report.user_email,
            "report_date": str(report.report_date),
            "hemoglobin": float(report.hemoglobin) if report.hemoglobin is not None else None,
            "hb_status": report.hb_status,
            "rbc_count": float(report.rbc_count) if report.rbc_count is not None else None,
            "rbc_status": report.rbc_status,
            "pcv": float(report.pcv) if report.pcv is not None else None,
            "pcv_status": report.pcv_status,
            "mcv": float(report.mcv) if report.mcv is not None else None,
            "mcv_status": report.mcv_status,
            "mch": float(report.mch) if report.mch is not None else None,
            "mch_status": report.mch_status,
            "mchc": float(report.mchc) if report.mchc is not None else None,
            "mchc_status": report.mchc_status,
            "rdw": float(report.rdw) if report.rdw is not None else None,
            "rdw_status": report.rdw_status,
            "wbc_count": int(report.wbc_count) if report.wbc_count is not None else None,
            "wbc_status": report.wbc_status,
            "platelet_count": int(report.platelet_count) if report.platelet_count is not None else None,
            "platelet_status": report.platelet_status
        }

        return {
            "success": True,
            "message": "CBC report fetched successfully",
            "data": data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch CBC report: {str(e)}")


@router.get("/weight-records")
def get_weight_records(gmail: str, db: Session = Depends(get_db)):
    """Fetch weight records for a user."""
    try:
        records = crud.get_weight_records(db, user_email=gmail)
        
        # Format the response
        data = [
            {
                "id": record.id,
                "user_email": record.user_email,
                "record_date": str(record.record_date),
                "weight": float(record.weight)
            }
            for record in records
        ]
        
        return {
            "success": True,
            "message": "Weight records fetched successfully",
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch weight records: {str(e)}")



