from sqlalchemy.orm import Session
from app.models.MedicalRecord import MedicalRecord
from app.schemas.medicalrecord import MedicalRecordCreate

def create_medical_record(db: Session, medical_record: MedicalRecordCreate):
    db_medical_record = MedicalRecord(**medical_record.dict())
    db.add(db_medical_record)
    db.commit()
    db.refresh(db_medical_record)
    return db_medical_record

def get_medical_records(db: Session, skip: int = 0, limit: int = 100):
    return db.query(MedicalRecord).offset(skip).limit(limit).all()

def get_medical_record(db: Session, medical_record_id: int):
    return db.query(MedicalRecord).filter(MedicalRecord.id == medical_record_id).first()

def get_medical_records_by_patient(db: Session, patient_id: int):
    return db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient_id).all()