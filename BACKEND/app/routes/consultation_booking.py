from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud

router = APIRouter(prefix="/consultation_booking", tags=["Consultation Booking"])

@router.get("/")
def get_consultation_bookings(db: Session = Depends(get_db)):
    # Automatically seed database if empty
    crud.seed_consultation_bookings(db)
    
    # Fetch doctors
    doctors = crud.get_consultation_bookings(db)
    
    return {
        "success": True,
        "message": "Doctors fetched successfully",
        "data": doctors
    }
