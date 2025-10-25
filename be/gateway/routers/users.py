from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from passlib.context import CryptContext

from shared.db import get_db
from shared import models, schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# CREATE
@router.post("/", response_model=schemas.UsuarioOut, status_code=status.HTTP_201_CREATED)
def crear_usuario(
    body: schemas.UsuarioCreate,
    db: Session = Depends(get_db),
):

    data = body.model_dump(exclude={"password"})

    usuario = models.Usuario(**data)
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario

# LIST (paginado y filtros simples)
@router.get("/", response_model=List[schemas.UsuarioOut])
def listar_usuarios(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None, description="Filtra por name o code que contenga el texto"),
):
    q = db.query(models.Usuario)
    if role:
        q = q.filter(models.Usuario.role == role)
    if search:
        like = f"%{search}%"
        q = q.filter((models.Usuario.name.ilike(like)) | (models.Usuario.code.ilike(like)))
    return q.offset(skip).limit(limit).all()

@router.post("/login", response_model=schemas.UsuarioOut)
def login_usuario(body: schemas.UsuarioLogin, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.name == body.name).first()
    if not usuario or not body.code == usuario.code :
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")
    return usuario

# GET by id
@router.get("/{usuario_id}", response_model=schemas.UsuarioOut)
def obtener_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

# UPDATE parcial (PATCH)
@router.patch("/{usuario_id}", response_model=schemas.UsuarioOut)
def actualizar_usuario(
    usuario_id: int,
    body: schemas.UsuarioUpdate,
    db: Session = Depends(get_db),
):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    update_data = body.model_dump(exclude_unset=True)

    # Validar unicidad de code si viene en update
    new_code = update_data.get("code")
    if new_code and new_code != usuario.code:
        exists = db.query(models.Usuario).filter(models.Usuario.code == new_code).first()
        if exists:
            raise HTTPException(status_code=400, detail="El code ya está en uso")

    # Password
    if "password" in update_data and update_data["password"]:
        usuario.hashed_password = hash_password(update_data.pop("password"))
    # Resto de campos
    for k, v in update_data.items():
        setattr(usuario, k, v)

    db.commit()
    db.refresh(usuario)
    return usuario

# DELETE
@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(usuario)
    db.commit()
    return