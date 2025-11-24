from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
import app.crud.medicalrecord as crud
from app.schemas.medicalrecord import MedicalRecord, MedicalRecordCreate
from app.schemas.medicalrecord import MedicalRecordUpdate
router = APIRouter()

@router.post("/", response_model=MedicalRecord)
def create_medical_record(medical_record: MedicalRecordCreate, db: Session = Depends(get_db)):
    return crud.create_medical_record(db=db, medical_record=medical_record)

@router.get("/", response_model=list[MedicalRecord])
def read_medical_records(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    medical_records = crud.get_medical_records(db, skip=skip, limit=limit)
    return medical_records

@router.get("/{medical_record_id}", response_model=MedicalRecord)
def read_medical_record(medical_record_id: int, db: Session = Depends(get_db)):
    db_medical_record = crud.get_medical_record(db, medical_record_id=medical_record_id)
    if db_medical_record is None:
        raise HTTPException(status_code=404, detail="Historial médico no encontrado")
    return db_medical_record

@router.get("/patient/{patient_id}", response_model=list[MedicalRecord])
def read_medical_records_by_patient(patient_id: int, db: Session = Depends(get_db)):
    medical_records = crud.get_medical_records_by_patient(db, patient_id=patient_id)
    return medical_records

@router.put("/{medical_record_id}", response_model=MedicalRecord)
def update_medical_record(medical_record_id: int, medical_record: MedicalRecordUpdate, db: Session = Depends(get_db)):
    db_medical_record = crud.update_medical_record(db, medical_record_id=medical_record_id, medical_record_update=medical_record)
    if db_medical_record is None:
        raise HTTPException(status_code=404, detail="Historial médico no encontrado")
    return db_medical_record

@router.delete("/{medical_record_id}")
def delete_medical_record(medical_record_id: int, db: Session = Depends(get_db)):
    success = crud.delete_medical_record(db, medical_record_id=medical_record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Historial médico no encontrado")
    return {"message": "Historial médico eliminado correctamente"}
