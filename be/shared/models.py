from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from shared.db import Base
from datetime import datetime

class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=False, default="operador")

class Maquina(Base):
    __tablename__ = "maquinas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(String)
    numero_serie = Column(String, unique=True, index=True, nullable=False)
    motor = Column(String)

    lecturas = relationship("LecturaMaquina", back_populates="maquina", cascade="all, delete-orphan")

class LecturaMaquina(Base):
    __tablename__ = "lecturas_maquina"

    id = Column(Integer, primary_key=True, index=True)
    maquina_id = Column(Integer, ForeignKey("maquinas.id", ondelete="CASCADE"), nullable=False)
    timestamp_lectura = Column(DateTime, default=datetime.utcnow)
    timestamp_arranque = Column(DateTime, nullable=True)
    temperatura = Column(Float)
    vibracion = Column(Float)
    presion = Column(Float)
    rpm_motor = Column(Integer)

    maquina = relationship("Maquina", back_populates="lecturas")