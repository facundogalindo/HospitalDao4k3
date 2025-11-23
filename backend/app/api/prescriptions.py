from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
import app.crud.prescription as crud
from app.schemas.prescription import Prescription, PrescriptionCreate

router = APIRouter()

@router.post("/", response_model=Prescription)
def create_prescription(prescription: PrescriptionCreate, db: Session = Depends(get_db)):
    return crud.create_prescription(db=db, prescription=prescription)

@router.get("/", response_model=list[Prescription])
def read_prescriptions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    prescriptions = crud.get_prescriptions(db, skip=skip, limit=limit)
    return prescriptions

@router.get("/{prescription_id}", response_model=Prescription)
def read_prescription(prescription_id: int, db: Session = Depends(get_db)):
    db_prescription = crud.get_prescription(db, prescription_id=prescription_id)
    if db_prescription is None:
        raise HTTPException(status_code=404, detail="Receta no encontrada")
    return db_prescription

@router.get("/medical-record/{medical_record_id}", response_model=list[Prescription])
def read_prescriptions_by_medical_record(medical_record_id: int, db: Session = Depends(get_db)):
    prescriptions = crud.get_prescriptions_by_medical_record(db, medical_record_id=medical_record_id)
    return prescriptions