from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional

from shared.db import get_db
from shared import models, schemas

router = APIRouter()

@router.post("/", response_model=schemas.MaquinaOut, status_code=status.HTTP_201_CREATED)
def crear_maquina(
    body: schemas.MaquinaCreate,
    db: Session = Depends(get_db),
):
    # Validar unicidad de numero_serie
    exists = db.execute(
        select(models.Maquina).where(models.Maquina.numero_serie == body.numero_serie)
    ).scalars().first()
    if exists:
        raise HTTPException(status_code=400, detail="El número de serie ya existe")

    m = models.Maquina(**body.model_dump())
    db.add(m)
    db.commit()
    db.refresh(m)
    return m

@router.get("/", response_model=List[schemas.MaquinaOut])
def listar_maquinas(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = Query(None, description="Busca por nombre, número de serie o motor"),
):
    stmt = select(models.Maquina)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(
            (models.Maquina.nombre.ilike(like)) |
            (models.Maquina.numero_serie.ilike(like)) |
            (models.Maquina.motor.ilike(like))
        )
    stmt = stmt.offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

@router.get("/{maquina_id}", response_model=schemas.MaquinaOut)
def obtener_maquina(
    maquina_id: int,
    db: Session = Depends(get_db),
):
    m = db.get(models.Maquina, maquina_id)
    if not m:
        raise HTTPException(status_code=404, detail="Máquina no encontrada")
    return m

@router.patch("/{maquina_id}", response_model=schemas.MaquinaOut)
def actualizar_maquina(
    maquina_id: int,
    body: schemas.MaquinaUpdate,
    db: Session = Depends(get_db),
):
    m = db.get(models.Maquina, maquina_id)
    if not m:
        raise HTTPException(status_code=404, detail="Máquina no encontrada")

    data = body.model_dump(exclude_unset=True)

    # Unicidad de numero_serie si cambia
    if "numero_serie" in data and data["numero_serie"] != m.numero_serie:
        exists = db.execute(
            select(models.Maquina).where(models.Maquina.numero_serie == data["numero_serie"])
        ).scalars().first()
        if exists:
            raise HTTPException(status_code=400, detail="El número de serie ya existe")

    for k, v in data.items():
        setattr(m, k, v)

    db.commit()
    db.refresh(m)
    return m

@router.delete("/{maquina_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_maquina(
    maquina_id: int,
    db: Session = Depends(get_db),
):
    m = db.get(models.Maquina, maquina_id)
    if not m:
        raise HTTPException(status_code=404, detail="Máquina no encontrada")
    db.delete(m)
    db.commit()
    return