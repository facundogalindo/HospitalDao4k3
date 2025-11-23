from sqlalchemy.orm import Session
from app.models.Specialty import Specialty
from app.schemas.specialty import SpecialtyCreate, SpecialtyUpdate

def get_specialty(db: Session, specialty_id: int):
    return db.query(Specialty).filter(Specialty.id == specialty_id).first()

def get_specialties(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Specialty).offset(skip).limit(limit).all()

def create_specialty(db: Session, specialty: SpecialtyCreate):
    db_specialty = Specialty(**specialty.dict())
    db.add(db_specialty)
    db.commit()
    db.refresh(db_specialty)
    return db_specialty

def update_specialty(db: Session, specialty_id: int, specialty: SpecialtyUpdate):
    db_specialty = db.query(Specialty).filter(Specialty.id == specialty_id).first()
    if db_specialty:
        update_data = specialty.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_specialty, field, value)
        db.commit()
        db.refresh(db_specialty)
    return db_specialty

def delete_specialty(db: Session, specialty_id: int):
    db_specialty = db.query(Specialty).filter(Specialty.id == specialty_id).first()
    if db_specialty:
        db.delete(db_specialty)
        db.commit()
    return db_specialty