from sqlalchemy import Column, Integer, String, ForeignKey, Date, Numeric, Text, Time
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # doctor or patient


class Profile(Base):
    __tablename__ = "profile"

    patient_id = Column(String(20), primary_key=True, index=True)
    name = Column(String(100), nullable=True)
    email = Column(String(100), nullable=True, index=True)
    contact_number = Column(String(15), nullable=True)
    dob = Column(Date, nullable=True)
    blood_type = Column(String(5), nullable=True)
    allergies = Column(Text, nullable=True)
    sex = Column(String(10), nullable=True)
    age = Column(Integer, nullable=True)
    height = Column(Numeric(5, 2), nullable=True)
    weight = Column(Numeric(5, 2), nullable=True)

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_gmail = Column(String, index=True, nullable=False)
    report_title = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    drive_link = Column(String, nullable=False)
    doctor_name = Column(String, nullable=False)
    hospital_name = Column(String, nullable=False)


class Medication(Base):
    __tablename__ = "medication"

    id = Column(Integer, primary_key=True, index=True)
    user_gmail = Column(String(255), index=True, nullable=False)
    pill_name = Column(String(255), nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    duration = Column(Integer, nullable=True)
    timing_in_day = Column(String(100), nullable=True)
    status = Column(String(50), nullable=True)
    medication_for = Column(String(255), nullable=True)


class Consultation(Base):
    __tablename__ = "consultation"

    id = Column(Integer, primary_key=True, index=True)
    user_gmail = Column(String(255), index=True, nullable=False)
    consult_reason = Column(Text, nullable=True)
    consultation_date = Column(Date, nullable=True)
    consultation_time = Column(Time, nullable=True)
    doctor = Column(String(255), nullable=True)
    hospital = Column(String(255), nullable=True)
    consultation_mode = Column(String(20), nullable=True)  # "online" or "offline"
    consultation_type = Column(String(100), nullable=True)

class ConsultationBooking(Base):
    __tablename__ = "consultation_booking"

    id = Column(Integer, primary_key=True, index=True)
    doctor_name = Column(String, nullable=False)
    specialization = Column(String, nullable=False)
    doctor_type = Column(String, nullable=False)
    experience_years = Column(Integer, nullable=False)
    rating = Column(Numeric, nullable=True)
    consultation_fee = Column(Integer, nullable=True)
    mode = Column(String, nullable=True)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)


class HeartRateReport(Base):
    __tablename__ = "heart_rate_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(255), index=True, nullable=False)
    record_date = Column(Date, nullable=False)
    heart_rate = Column(Integer, nullable=False)

class BloodPressure(Base):
    __tablename__ = "blood_pressure"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(255), index=True, nullable=False)
    bp_date = Column(Date, nullable=False)
    systolic = Column(Integer, nullable=False)
    diastolic = Column(Integer, nullable=False)

class Weight(Base):
    __tablename__ = "weight_records"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(255), index=True, nullable=False)
    record_date = Column(Date, nullable=False)
    weight = Column(Numeric(5, 2), nullable=False)


class CBCReport(Base):
    __tablename__ = "cbc_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(255), index=True, nullable=False)
    report_date = Column(Date, nullable=False)

    hemoglobin = Column(Numeric(5, 2), nullable=True)
    hb_min = Column(Numeric(5, 2), nullable=True)
    hb_max = Column(Numeric(5, 2), nullable=True)
    hb_status = Column(String(50), nullable=True)

    rbc_count = Column(Numeric(5, 2), nullable=True)
    rbc_min = Column(Numeric(5, 2), nullable=True)
    rbc_max = Column(Numeric(5, 2), nullable=True)
    rbc_status = Column(String(50), nullable=True)

    pcv = Column(Numeric(5, 2), nullable=True)
    pcv_min = Column(Numeric(5, 2), nullable=True)
    pcv_max = Column(Numeric(5, 2), nullable=True)
    pcv_status = Column(String(50), nullable=True)

    mcv = Column(Numeric(5, 2), nullable=True)
    mcv_min = Column(Numeric(5, 2), nullable=True)
    mcv_max = Column(Numeric(5, 2), nullable=True)
    mcv_status = Column(String(50), nullable=True)

    mch = Column(Numeric(5, 2), nullable=True)
    mch_min = Column(Numeric(5, 2), nullable=True)
    mch_max = Column(Numeric(5, 2), nullable=True)
    mch_status = Column(String(50), nullable=True)

    mchc = Column(Numeric(5, 2), nullable=True)
    mchc_min = Column(Numeric(5, 2), nullable=True)
    mchc_max = Column(Numeric(5, 2), nullable=True)
    mchc_status = Column(String(50), nullable=True)

    rdw = Column(Numeric(5, 2), nullable=True)
    rdw_min = Column(Numeric(5, 2), nullable=True)
    rdw_max = Column(Numeric(5, 2), nullable=True)
    rdw_status = Column(String(50), nullable=True)

    wbc_count = Column(Integer, nullable=True)
    wbc_min = Column(Integer, nullable=True)
    wbc_max = Column(Integer, nullable=True)
    wbc_status = Column(String(50), nullable=True)

    neutrophils = Column(Numeric(5, 2), nullable=True)
    neutro_min = Column(Numeric(5, 2), nullable=True)
    neutro_max = Column(Numeric(5, 2), nullable=True)
    neutro_status = Column(String(50), nullable=True)

    lymphocytes = Column(Numeric(5, 2), nullable=True)
    lympho_min = Column(Numeric(5, 2), nullable=True)
    lympho_max = Column(Numeric(5, 2), nullable=True)
    lympho_status = Column(String(50), nullable=True)

    eosinophils = Column(Numeric(5, 2), nullable=True)
    eos_min = Column(Numeric(5, 2), nullable=True)
    eos_max = Column(Numeric(5, 2), nullable=True)
    eos_status = Column(String(50), nullable=True)

    monocytes = Column(Numeric(5, 2), nullable=True)
    mono_min = Column(Numeric(5, 2), nullable=True)
    mono_max = Column(Numeric(5, 2), nullable=True)
    mono_status = Column(String(50), nullable=True)

    basophils = Column(Numeric(5, 2), nullable=True)
    baso_min = Column(Numeric(5, 2), nullable=True)
    baso_max = Column(Numeric(5, 2), nullable=True)
    baso_status = Column(String(50), nullable=True)

    platelet_count = Column(Integer, nullable=True)
    platelet_min = Column(Integer, nullable=True)
    platelet_max = Column(Integer, nullable=True)
    platelet_status = Column(String(50), nullable=True)