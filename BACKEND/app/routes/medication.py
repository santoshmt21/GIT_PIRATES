from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date

from app.database import get_db
from app import crud
from app.schemas import MedicationCreate

router = APIRouter(prefix="/medications", tags=["Medications"])


@router.get("/")
def get_user_medications(gmail: str, db: Session = Depends(get_db)):
    """
    Fetch all medication entries for a given user.
    Status is auto-computed: 'active' if end_date >= today, 'completed' otherwise.
    """
    medications = crud.get_medications_by_gmail(db, gmail=gmail)

    if not medications:
        raise HTTPException(
            status_code=404,
            detail=f"No medications found for {gmail}"
        )

    today = date.today()

    return {
        "success": True,
        "message": "Medications fetched successfully",
        "data": [
            {
                "id": med.id,
                "user_gmail": med.user_gmail,
                "pill_name": med.pill_name,
                "start_date": str(med.start_date) if med.start_date else None,
                "end_date": str(med.end_date) if med.end_date else None,
                "duration": med.duration,
                "timing_in_day": med.timing_in_day,
                "status": "completed" if (med.end_date and med.end_date < today) else "active",
                "medication_for": med.medication_for,
            }
            for med in medications
        ]
    }


@router.post("/")
def add_medication(data: MedicationCreate, gmail: str = Query(...), db: Session = Depends(get_db)):
    """
    Add a new medication for the user.
    """
    med = crud.create_medication(db, gmail=gmail, data=data)
    today = date.today()
    return {
        "success": True,
        "message": "Medication added successfully",
        "data": {
            "id": med.id,
            "user_gmail": med.user_gmail,
            "pill_name": med.pill_name,
            "start_date": str(med.start_date) if med.start_date else None,
            "end_date": str(med.end_date) if med.end_date else None,
            "duration": med.duration,
            "timing_in_day": med.timing_in_day,
            "status": "completed" if (med.end_date and med.end_date < today) else "active",
            "medication_for": med.medication_for,
        }
    }

