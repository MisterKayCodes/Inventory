from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.data.database import engine, Base
from app.api.auth import router as auth_router
from app.api.shops import router as shops_router
from app.api.categories import router as categories_router
from app.api.products import router as products_router
from app.api.transactions import router as transactions_router
from config import settings

# 1. Initialize Database Tables
# In early development phase, this ensures our tables exist automatically on startup.
# Later, we can transition fully to Alembic migrations.
Base.metadata.create_all(bind=engine)

# 2. Instantiate FastAPI App
app = FastAPI(
    title=settings.APP_NAME,
    description="A multi-tenant, secure inventory and serial verification API.",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url=None
)

# 3. Configure CORS (Cross-Origin Resource Sharing)
# Crucial for allowing React (on port 5173) to fetch from FastAPI (on port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production to explicitly whitelist React frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Mount API Routers
app.include_router(auth_router)
app.include_router(shops_router)
app.include_router(categories_router)
app.include_router(transactions_router)
app.include_router(products_router)

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "mode": "development" if settings.DEBUG else "production"
    }
