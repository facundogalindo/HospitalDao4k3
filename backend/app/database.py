"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


DATABASE_URL = "postgresql://usuario:contraseña@localhost:5432/turnos_medico"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
"""

# con SQLite

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Base de datos SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./turnero_medico.db"

# 🔥 FIX PARA EVITAR LOCKS
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    pool_pre_ping=True,          # 🔥 Evita conexiones muertas
    pool_size=5,                 # 🔥 Pequeño pool
    max_overflow=10,             # 🔥 Evita saturación
    pool_timeout=30              # 🔥 Reintenta antes de lanzar "database locked"
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
