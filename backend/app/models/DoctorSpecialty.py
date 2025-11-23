from sqlalchemy import Column, Integer, ForeignKey
from app.database import Base

class DoctorSpecialty(Base):
    __tablename__ = 'doctor_specialties'

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey('doctors.id', ondelete='CASCADE'))
    specialty_id = Column(Integer, ForeignKey('specialties.id', ondelete='CASCADE'))