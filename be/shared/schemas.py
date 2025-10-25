from pydantic import BaseModel, Field 
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime


class PredictionRequest(BaseModel):
    features: List[float]
    metadata: Optional[Dict[str, Any]] = None

class PredictionResponse(BaseModel):
    prediction: float
    confidence: float
    metadata: Dict[str, Any]


Role = Literal["OPERADOR", "ADMINISTRADOR"]

class UsuarioBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    code: str = Field(..., min_length=1, max_length=100)
    role: Role = "OPERADOR"

class UsuarioCreate(UsuarioBase):
    password: Optional[str] = Field(default=None, min_length=6)

class UsuarioUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    code: Optional[str] = Field(default=None, min_length=1, max_length=100)
    role: Optional[Role] = None
    password: Optional[str] = Field(default=None, min_length=4)

class UsuarioLogin(BaseModel):
    code: str 
    name: str 

class UsuarioOut(BaseModel):
    id: int
    name: str
    code: str
    role: Role

    class Config:
        from_attributes = True

# Maquina
class MaquinaBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=200)
    descripcion: Optional[str] = None
    numero_serie: str = Field(..., min_length=1, max_length=200)
    motor: Optional[str] = None

class MaquinaCreate(MaquinaBase):
    pass

class MaquinaUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=200)
    descripcion: Optional[str] = None
    numero_serie: Optional[str] = Field(None, min_length=1, max_length=200)
    motor: Optional[str] = None

class MaquinaOut(MaquinaBase):
    id: int
    class Config:
        from_attributes = True

# Lectura
class LecturaBase(BaseModel):
    temperatura: Optional[float] = None
    vibracion: Optional[float] = None
    presion: Optional[float] = None
    rpm_motor: Optional[int] = None
    timestamp_lectura: Optional[datetime] = None
    timestamp_arranque: Optional[datetime] = None

class LecturaCreate(LecturaBase):
    maquina_id: int

class LecturaUpdate(LecturaBase):
    pass

class LecturaOut(LecturaBase):
    id: int
    maquina_id: int
    class Config:
        from_attributes = True

# Maquina detallada con lecturas (opcional)
class MaquinaWithLecturas(MaquinaOut):
    lecturas: List[LecturaOut] = []