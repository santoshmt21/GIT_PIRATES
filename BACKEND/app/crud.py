from sqlalchemy.orm import Session
from sqlalchemy import text
from app import models
from fastapi import HTTPException
import bcrypt
import hashlib

print("THIS IS THE REAL CRUD FILE")

def _normalize_password(password: str) -> bytes:
    """Keep bcrypt input within 72 bytes while remaining deterministic."""
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        return hashlib.sha256(password_bytes).hexdigest().encode("utf-8")
    return password_bytes

def get_password_hash(password: str):
    normalized = _normalize_password(password)
    return bcrypt.hashpw(normalized, bcrypt.gensalt()).decode("utf-8")

def create_user(db: Session, user):

    # 🔥 CHECK IF EMAIL EXISTS
    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = get_password_hash(user.password)

    db_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role=user.role
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user
def login_user(db: Session, user):

    # 🔎 Find user by email
    db_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # 🔐 Check role
    if db_user.role != user.role:
        raise HTTPException(status_code=400, detail="Invalid role selected")

    # 🔐 Verify password
    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    return {
        "message": "Login successful",
        "user_id": db_user.id,
        "name": db_user.name,
        "role": db_user.role
    }


def verify_password(plain_password, hashed_password):
    try:
        normalized = _normalize_password(plain_password)
        return bcrypt.checkpw(normalized, hashed_password.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def get_profile_by_gmail(db: Session, gmail: str):
    # Query profile directly by email
    profile = db.query(models.Profile).filter(
        models.Profile.email == gmail
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Return profile data
    return {
        "patientId": profile.patient_id,
        "name": profile.name,
        "email": profile.email,
        "contactNumber": profile.contact_number,
        "dob": profile.dob,
        "bloodType": profile.blood_type,
        "allergies": profile.allergies,
        "sex": profile.sex,
        "age": profile.age,
        "height": profile.height,
    }

def create_report(db: Session, report_data: dict):
    db_report = models.Report(**report_data)
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def get_reports_by_gmail(db: Session, gmail: str):
    reports = db.query(models.Report).filter(
        models.Report.user_gmail == gmail
    ).all()
    return reports


def get_medications_by_gmail(db: Session, gmail: str):
    medications = db.query(models.Medication).filter(
        models.Medication.user_gmail == gmail
    ).all()
    return medications


def create_medication(db: Session, gmail: str, data):
    from datetime import datetime, date as date_type

    start_parsed = None
    end_parsed = None
    if data.start_date:
        try:
            start_parsed = datetime.strptime(data.start_date, "%Y-%m-%d").date()
        except ValueError:
            pass
    if data.end_date:
        try:
            end_parsed = datetime.strptime(data.end_date, "%Y-%m-%d").date()
        except ValueError:
            pass

    # Auto-compute status based on end_date
    today = date_type.today()
    if end_parsed and end_parsed < today:
        status = "completed"
    else:
        status = "active"

    # Auto-compute duration if both dates provided
    duration = data.duration
    if not duration and start_parsed and end_parsed:
        duration = (end_parsed - start_parsed).days

    med = models.Medication(
        user_gmail=gmail,
        pill_name=data.pill_name,
        start_date=start_parsed,
        end_date=end_parsed,
        duration=duration,
        timing_in_day=data.timing_in_day,
        status=status,
        medication_for=data.medication_for,
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    return med


def get_consultations_by_gmail(db: Session, gmail: str):
    result = db.execute(
        text("SELECT * FROM consultation WHERE user_gmail ILIKE :gmail"),
        {"gmail": gmail}
    )
    rows = result.mappings().all()
    print(f"[DEBUG] Consultation query for '{gmail}' → {len(rows)} row(s) found")
    return [dict(row) for row in rows]


def create_consultation(db: Session, gmail: str, data):
    from datetime import datetime
    
    date_parsed = None
    if data.consultation_date:
        try:
            date_parsed = datetime.strptime(data.consultation_date, "%Y-%m-%d").date()
        except ValueError:
            pass

    time_parsed = None
    if data.consultation_time:
        try:
            time_parsed = datetime.strptime(data.consultation_time, "%H:%M").time()
        except ValueError:
            try:
                # Handle HH:MM:SS if sent
                time_parsed = datetime.strptime(data.consultation_time, "%H:%M:%S").time()
            except ValueError:
                pass

    consultation = models.Consultation(
        user_gmail=gmail,
        consult_reason=data.consult_reason,
        consultation_date=date_parsed,
        consultation_time=time_parsed,
        doctor=data.doctor,
        hospital=data.hospital,
        consultation_mode=data.consultation_mode,
        consultation_type=data.consultation_type
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)
    return consultation

def upsert_profile(db: Session, gmail: str, data):
    from datetime import date as date_type
    profile = db.query(models.Profile).filter(models.Profile.email == gmail).first()

    dob_parsed = None
    if data.dob:
        try:
            from datetime import datetime
            dob_parsed = datetime.strptime(data.dob, "%Y-%m-%d").date()
        except ValueError:
            dob_parsed = None

    if profile:
        # Update existing
        if data.name is not None:          profile.name = data.name
        if data.contact_number is not None: profile.contact_number = data.contact_number
        if data.dob is not None:           profile.dob = dob_parsed
        if data.blood_type is not None:    profile.blood_type = data.blood_type
        if data.allergies is not None:     profile.allergies = data.allergies
        if data.sex is not None:           profile.sex = data.sex
        if data.age is not None:           profile.age = data.age
        if data.height is not None:        profile.height = data.height
        if data.weight is not None:        profile.weight = data.weight
    else:
        # Create new profile row
        import random, string
        pid = data.patient_id or ("BGS" + "".join(random.choices(string.digits, k=9)))
        profile = models.Profile(
            patient_id=pid,
            name=data.name,
            email=gmail,
            contact_number=data.contact_number,
            dob=dob_parsed,
            blood_type=data.blood_type,
            allergies=data.allergies,
            sex=data.sex,
            age=data.age,
            height=data.height,
            weight=data.weight,
        )
        db.add(profile)

    db.commit()
    db.refresh(profile)
    return {
        "patientId": profile.patient_id,
        "name": profile.name,
        "email": profile.email,
        "contactNumber": profile.contact_number,
        "dob": str(profile.dob) if profile.dob else None,
        "bloodType": profile.blood_type,
        "allergies": profile.allergies,
        "sex": profile.sex,
        "age": profile.age,
        "height": str(profile.height) if profile.height else None,
        "weight": str(profile.weight) if profile.weight else None,
    }

def get_consultation_bookings(db: Session):
    return db.query(models.ConsultationBooking).all()

def seed_consultation_bookings(db: Session):
    pass


def get_heart_rate_reports(db: Session, user_email: str):
    """Fetch all heart rate reports for a user."""
    return db.query(models.HeartRateReport).filter(
        models.HeartRateReport.user_email == user_email
    ).order_by(models.HeartRateReport.record_date.asc()).all()


def create_heart_rate_report(db: Session, user_email: str, record_date, heart_rate: int):
    """Create a new heart rate report."""
    db_report = models.HeartRateReport(
        user_email=user_email,
        record_date=record_date,
        heart_rate=heart_rate
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


def get_blood_pressure_reports(db: Session, user_email: str):
    """Fetch all blood pressure reports for a user."""
    return db.query(models.BloodPressure).filter(
        models.BloodPressure.user_email == user_email
    ).order_by(models.BloodPressure.bp_date.asc()).all()


def create_blood_pressure_report(db: Session, user_email: str, bp_date, systolic: int, diastolic: int):
    """Create a new blood pressure report."""
    db_report = models.BloodPressure(
        user_email=user_email,
        bp_date=bp_date,
        systolic=systolic,
        diastolic=diastolic
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


def get_weight_records(db: Session, user_email: str):
    """Fetch all weight records for a user."""
    return db.query(models.Weight).filter(
        models.Weight.user_email == user_email
    ).order_by(models.Weight.record_date.asc()).all()


def get_latest_cbc_report(db: Session, user_email: str):
    """Fetch the most recent CBC report for a user."""
    return db.query(models.CBCReport).filter(
        models.CBCReport.user_email == user_email
    ).order_by(models.CBCReport.report_date.desc()).first()


def create_weight_record(db: Session, user_email: str, record_date, weight: float):
    """Create a new weight record."""
    db_record = models.Weight(
        user_email=user_email,
        record_date=record_date,
        weight=weight
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

