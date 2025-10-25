from fastapi import FastAPI, HTTPException
from ai_module.services.prediction_service import PredictionService
from ai_module.schemas import PredictionRequest, PredictionResponse
from typing import List

app = FastAPI(
    title="AI Prediction Module",
    description="Módulo de análisis predictivo",
    version="1.0.0"
)

prediction_service = PredictionService()

@app.get("/")
async def root():
    return {"message": "AI Module activo"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": prediction_service.is_model_loaded()}

@app.post("/api/v1/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Realizar predicción"""
    try:
        result = prediction_service.predict(request.features)
        return PredictionResponse(
            prediction=result["prediction"],
            confidence=result["confidence"],
            metadata=result.get("metadata", {})
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/train")
async def train_model(data: dict):
    """Entrenar o actualizar modelo"""
    try:
        result = prediction_service.train(data)
        return {"status": "success", "metrics": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ai_module.main:app", host="0.0.0.0", port=8001, reload=True)