from fastapi import APIRouter, HTTPException
import httpx
from typing import Dict, Any

router = APIRouter()

AI_MODULE_URL = "http://localhost:8001"

@router.post("/predict")
async def predict_service(data: Dict[str, Any]):
    """Proxy al módulo de IA"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{AI_MODULE_URL}/api/v1/predict",
                json=data,
                timeout=30.0
            )
            return response.json()
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail="Servicio de IA no disponible")

@router.get("/services/status")
async def services_status():
    """Verificar estado de servicios"""
    services = {
        "ai_module": await check_service(f"{AI_MODULE_URL}/health")
    }
    return services

async def check_service(url: str) -> str:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=5.0)
            return "online" if response.status_code == 200 else "offline"
        except:
            return "offline"