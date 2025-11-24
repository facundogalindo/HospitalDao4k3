from sqlalchemy.orm import Session
from app.models.Prescription import Prescription
from app.schemas.prescription import PrescriptionCreate
from app.schemas.prescription import PrescriptionCreate, PrescriptionUpdate
def create_prescription(db: Session, prescription: PrescriptionCreate):
    db_prescription = Prescription(**prescription.dict())
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    return db_prescription

def get_prescriptions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Prescription).offset(skip).limit(limit).all()

def get_prescription(db: Session, prescription_id: int):
    return db.query(Prescription).filter(Prescription.id == prescription_id).first()

def get_prescriptions_by_medical_record(db: Session, medical_record_id: int):
    return db.query(Prescription).filter(Prescription.medical_record_id == medical_record_id).all()

def update_prescription(db: Session, prescription_id: int, prescription_update: PrescriptionUpdate):
    db_prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if db_prescription:
        # Actualizar solo los campos que vienen en la request
        update_data = prescription_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_prescription, field, value)
        db.commit()
        db.refresh(db_prescription)
    return db_prescription

def delete_prescription(db: Session, prescription_id: int):
    db_prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if db_prescription:
        db.delete(db_prescription)
        db.commit()
        return True
    return False