from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from datetime import datetime
from typing import List, Optional

from shared.db import get_db
from shared import models, schemas

router = APIRouter()

@router.post("/", response_model=schemas.LecturaOut, status_code=status.HTTP_201_CREATED)
def crear_lectura(
    body: schemas.LecturaCreate,
    db: Session = Depends(get_db),
):
    # Verificar que la máquina exista
    maquina = db.get(models.Maquina, body.maquina_id)
    if not maquina:
        raise HTTPException(status_code=404, detail="Máquina no encontrada")

    # Si no viene timestamp_lectura, se asignará por defecto en el modelo
    lectura = models.LecturaMaquina(**body.model_dump())
    db.add(lectura)
    db.commit()
    db.refresh(lectura)
    return lectura

@router.get("/", response_model=List[schemas.LecturaOut])
def listar_lecturas(
    db: Session = Depends(get_db),
    maquina_id: Optional[int] = Query(None),
    desde: Optional[datetime] = Query(None, description="Filtrar desde timestamp_lectura"),
    hasta: Optional[datetime] = Query(None, description="Filtrar hasta timestamp_lectura"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
):
    stmt = select(models.LecturaMaquina)

    if maquina_id is not None:
        stmt = stmt.where(models.LecturaMaquina.maquina_id == maquina_id)
    if desde is not None:
        stmt = stmt.where(models.LecturaMaquina.timestamp_lectura >= desde)
    if hasta is not None:
        stmt = stmt.where(models.LecturaMaquina.timestamp_lectura <= hasta)

    stmt = stmt.order_by(models.LecturaMaquina.timestamp_lectura.desc()).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

@router.get("/{lectura_id}", response_model=schemas.LecturaOut)
def obtener_lectura(
    lectura_id: int,
    db: Session = Depends(get_db),
):
    lectura = db.get(models.LecturaMaquina, lectura_id)
    if not lectura:
        raise HTTPException(status_code=404, detail="Lectura no encontrada")
    return lectura

@router.patch("/{lectura_id}", response_model=schemas.LecturaOut)
def actualizar_lectura(
    lectura_id: int,
    body: schemas.LecturaUpdate,
    db: Session = Depends(get_db),
):
    lectura = db.get(models.LecturaMaquina, lectura_id)
    if not lectura:
        raise HTTPException(status_code=404, detail="Lectura no encontrada")

    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(lectura, k, v)

    db.commit()
    db.refresh(lectura)
    return lectura

@router.delete("/{lectura_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_lectura(
    lectura_id: int,
    db: Session = Depends(get_db),
):
    lectura = db.get(models.LecturaMaquina, lectura_id)
    if not lectura:
        raise HTTPException(status_code=404, detail="Lectura no encontrada")
    db.delete(lectura)
    db.commit()
    return