from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.specialty import Specialty, SpecialtyCreate, SpecialtyUpdate
import app.crud.specialty as crud_specialty

router = APIRouter(prefix="/specialties", tags=["specialties"])

@router.post("/", response_model=Specialty)
def create_specialty(specialty: SpecialtyCreate, db: Session = Depends(get_db)):
    return crud_specialty.create_specialty(db=db, specialty=specialty)

@router.get("/", response_model=List[Specialty])
def read_specialties(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    specialties = crud_specialty.get_specialties(db, skip=skip, limit=limit)
    return specialties

@router.get("/{specialty_id}", response_model=Specialty)
def read_specialty(specialty_id: int, db: Session = Depends(get_db)):
    db_specialty = crud_specialty.get_specialty(db, specialty_id=specialty_id)
    if db_specialty is None:
        raise HTTPException(status_code=404, detail="Specialty not found")
    return db_specialty

@router.put("/{specialty_id}", response_model=Specialty)
def update_specialty(specialty_id: int, specialty: SpecialtyUpdate, db: Session = Depends(get_db)):
    db_specialty = crud_specialty.update_specialty(db, specialty_id=specialty_id, specialty=specialty)
    if db_specialty is None:
        raise HTTPException(status_code=404, detail="Specialty not found")
    return db_specialty

@router.delete("/{specialty_id}")
def delete_specialty(specialty_id: int, db: Session = Depends(get_db)):
    db_specialty = crud_specialty.delete_specialty(db, specialty_id=specialty_id)
    if db_specialty is None:
        raise HTTPException(status_code=404, detail="Specialty not found")
    return {"message": "Specialty deleted successfully"}