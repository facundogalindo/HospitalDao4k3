from sqlalchemy.orm import Session
from app.models.Doctor import Doctor
from app.models.Specialty import Specialty
from app.models.DoctorSpecialty import DoctorSpecialty
from app.schemas.doctor import DoctorCreate, DoctorUpdate

def get_doctor(db: Session, doctor_id: int):
    return db.query(Doctor).filter(Doctor.id == doctor_id).first()

def get_doctors(db: Session, skip: int = 0, limit: int = 100):
    doctors = db.query(Doctor).offset(skip).limit(limit).all()
    
    doctors_data = []
    for doctor in doctors:
        # Obtener las especialidades del doctor
        specialties = []
        for doctor_specialty in doctor.specialties:
            specialties.append({
                "id": doctor_specialty.id,
                "name": doctor_specialty.name
            })
        
        doctor_dict = {
            "id": doctor.id,
            "first_name": doctor.first_name,
            "last_name": doctor.last_name,
            "license_number": doctor.license_number,
            "email": doctor.email,
            "phone": doctor.phone,
            "address": doctor.address,
            "created_at": doctor.created_at,
            "updated_at": doctor.updated_at,
            "specialties": specialties
        }
        doctors_data.append(doctor_dict)
    
    return doctors_data

def get_doctor_by_license(db: Session, license_number: str):
    return db.query(Doctor).filter(Doctor.license_number == license_number).first()

def add_specialties_to_doctor(db: Session, doctor_id: int, specialties: list):
    for specialty_id in specialties:
        specialty = db.query(Specialty).filter(Specialty.id == specialty_id).first()
        if specialty:
            db_specialty = DoctorSpecialty(doctor_id=doctor_id, specialty_id=specialty_id)
            db.add(db_specialty)
    db.commit()

def create_doctor(db: Session, doctor: DoctorCreate):
    if get_doctor_by_license(db, doctor.license_number):
        return None
    
    doctor_data = doctor.dict(exclude={'specialties'})
    db_doctor = Doctor(**doctor_data)
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    
    if doctor.specialties:
        add_specialties_to_doctor(db, db_doctor.id, doctor.specialties)
        db.refresh(db_doctor)
    
    return db_doctor

def delete_doctor(db: Session, doctor_id: int):
    db_doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if db_doctor:
        # Primero eliminar las especialidades asociadas
        db.query(DoctorSpecialty).filter(DoctorSpecialty.doctor_id == doctor_id).delete()
        
        # Luego eliminar el doctor
        db.delete(db_doctor)
        db.commit()
        return db_doctor
    return None

def update_doctor(db: Session, doctor_id: int, doctor: DoctorUpdate):
    db_doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if db_doctor:
        # Actualizar campos básicos
        update_data = doctor.dict(exclude_unset=True, exclude={'specialties'})
        for field, value in update_data.items():
            setattr(db_doctor, field, value)
        
        # Actualizar especialidades si se proporcionan
        if doctor.specialties is not None:
            # Eliminar especialidades existentes
            db.query(DoctorSpecialty).filter(DoctorSpecialty.doctor_id == doctor_id).delete()
            # Agregar nuevas especialidades
            add_specialties_to_doctor(db, doctor_id, doctor.specialties)
        
        db.commit()
        db.refresh(db_doctor)
        return db_doctor
    return None