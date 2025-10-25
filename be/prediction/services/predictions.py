import numpy as np
from sklearn.ensemble import RandomForestClassifier
from typing import Dict, List, Any
import joblib
import os

class PredictionService:
    def __init__(self):
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Cargar modelo pre-entrenado"""
        model_path = "ai_module/models/trained_model.pkl"
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
        else:
            # Modelo por defecto
            self.model = RandomForestClassifier(n_estimators=100)
    
    def is_model_loaded(self) -> bool:
        return self.model is not None
    
    def predict(self, features: List[float]) -> Dict[str, Any]:
        """Realizar predicción"""
        if not self.is_model_loaded():
            raise ValueError("Modelo no cargado")
        
        X = np.array(features).reshape(1, -1)
        prediction = self.model.predict(X)[0]
        
        # Obtener probabilidades si está disponible
        confidence = 0.0
        if hasattr(self.model, 'predict_proba'):
            proba = self.model.predict_proba(X)[0]
            confidence = float(max(proba))
        
        return {
            "prediction": float(prediction),
            "confidence": confidence,
            "metadata": {
                "features_count": len(features)
            }
        }
    
    def train(self, data: Dict[str, Any]) -> Dict[str, float]:
        """Entrenar modelo"""
        X = np.array(data["features"])
        y = np.array(data["labels"])
        
        self.model.fit(X, y)
        score = self.model.score(X, y)
        
        # Guardar modelo
        joblib.dump(self.model, "ai_module/models/trained_model.pkl")
        
        return {"accuracy": score}