from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str   # doctor or patient

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: str   # doctor or patient

class ProfileUpdate(BaseModel):
    patient_id: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    contact_number: Optional[str] = None
    dob: Optional[str] = None          # "YYYY-MM-DD"
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    sex: Optional[str] = None
    age: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None

class MedicationCreate(BaseModel):
    pill_name: str
    start_date: Optional[str] = None      # "YYYY-MM-DD"
    end_date: Optional[str] = None        # "YYYY-MM-DD"
    duration: Optional[int] = None
    timing_in_day: Optional[str] = None   # e.g. "morning-evening"
    medication_for: Optional[str] = None

class ConsultationCreate(BaseModel):
    consult_reason: Optional[str] = None
    consultation_date: Optional[str] = None    # "YYYY-MM-DD"
    consultation_time: Optional[str] = None    # "HH:MM"
    doctor: Optional[str] = None
    hospital: Optional[str] = None
    consultation_mode: Optional[str] = None    # "online" or "offline"
    consultation_type: Optional[str] = None    # "routine", "specialist", etc.
