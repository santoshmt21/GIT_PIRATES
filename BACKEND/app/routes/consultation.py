from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud
from app.schemas import ConsultationCreate

router = APIRouter(prefix="/consultations", tags=["Consultations"])


@router.get("/")
def get_user_consultations(gmail: str = Query(...), db: Session = Depends(get_db)):
    consultations = crud.get_consultations_by_gmail(db, gmail=gmail)
    return {
        "success": True,
        "message": "Consultations fetched successfully",
        "data": consultations
    }


@router.post("/")
def book_consultation(data: ConsultationCreate, gmail: str = Query(...), db: Session = Depends(get_db)):
    """
    Creates a new consultation entry (booking).
    """
    try:
        new_consult = crud.create_consultation(db, gmail=gmail, data=data)
        return {
            "success": True,
            "message": "Consultation booked successfully!",
            "data": {
                "id": new_consult.id,
                "doctor": new_consult.doctor,
                "consultation_date": str(new_consult.consultation_date),
                "consultation_time": str(new_consult.consultation_time)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
