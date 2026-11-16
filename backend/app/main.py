import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.session import init_db, AsyncSessionLocal
from backend.app.db.seeder import seed_database
from backend.app.services.market_gateway import market_gateway
from backend.app.services.market_ingestion import market_ingestion_worker
from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.market import router as market_router
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.portfolios import router as portfolios_router
from backend.app.api.v1.fundamentals import router as fundamentals_router
from backend.app.api.v1.technicals import router as technicals_router
from backend.app.api.v1.tools import router as tools_router
from backend.app.api.v1.news import router as news_router
from backend.app.api.v1.announcements import router as announcements_router
from backend.app.api.v1.macro import router as macro_router
from backend.app.api.v1.sentiment import router as sentiment_router
from backend.app.api.v1.admin import router as admin_router

# Configure Logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("growmore.app")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database Tables & Run Seeders
    logger.info("Initializing database tables...")
    await init_db()
    async with AsyncSessionLocal() as session:
        await seed_database(session)
    logger.info("Starting background market ingestion worker...")
    market_ingestion_worker.start()
    logger.info("Application startup complete.")
    
    yield
    
    # Shutdown: Cleanly close background HTTP connections and worker
    logger.info("Stopping background market ingestion worker...")
    await market_ingestion_worker.stop()
    logger.info("Closing adapter connections...")
    await market_gateway.close_all()
    logger.info("Application shutdown complete.")

app = FastAPI(
    title=settings.APP_NAME,
    description="Production Financial Intelligence, Investment & Portfolio Management API",
    version="1.0.0",
    lifespan=lifespan
)

# OWASP Security Hardening Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
    return response

# Cross-Origin Resource Sharing (CORS) Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route Registration
app.include_router(health_router, prefix=settings.API_V1_PREFIX)
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(portfolios_router, prefix=settings.API_V1_PREFIX)
app.include_router(fundamentals_router, prefix=settings.API_V1_PREFIX)
app.include_router(technicals_router, prefix=settings.API_V1_PREFIX)
app.include_router(tools_router, prefix=settings.API_V1_PREFIX)
app.include_router(news_router, prefix=settings.API_V1_PREFIX)
app.include_router(announcements_router, prefix=settings.API_V1_PREFIX)
app.include_router(macro_router, prefix=settings.API_V1_PREFIX)
app.include_router(sentiment_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)
app.include_router(market_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
async def root():
    return {
        "platform": settings.APP_NAME,
        "status": "active",
        "documentation": "/docs",
        "api_v1": settings.API_V1_PREFIX
    }
