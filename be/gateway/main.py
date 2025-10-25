from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from gateway.routers import users, services, maquinaria, lecturas

app = FastAPI(
    title="API Gateway",
    description="Gateway para múltiples servicios",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(maquinaria.router, prefix="/api/maquinas", tags=["maquinas"])
app.include_router(lecturas.router, prefix="/api/lecturas", tags=["lecturas"])
app.include_router(services.router, prefix="/api/services", tags=["services"])

@app.get("/")
async def root():
    return {"message": "API Gateway activo", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("gateway.main:app", host="0.0.0.0", port=8001, reload=True)