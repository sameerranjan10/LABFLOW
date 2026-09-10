from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import (
    auth, users, patients, tests, orders, samples, results, reports, dashboard, notifications, audit, search
)

# Auto-create tables on startup (works seamlessly alongside Alembic migrations)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    # Log database connection warning on import (e.g. during offline test execution or initial container build)
    print(f"Warning: Database auto-creation skipped or postponed ({e})")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = settings.CORS_ORIGINS
if settings.FRONTEND_URL not in origins:
    origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers for Standardized Response Envelopes
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": str(exc.detail)
            }
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    error_msg = errors[0].get("msg") if errors else "Validation error"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": f"Validation failure: {error_msg}"
            }
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected internal server error occurred"
            }
        }
    )


# Health Check Endpoints
@app.get("/health", tags=["Health Check"])
def health_check():
    """Service health check endpoint"""
    return {
        "status": "ok",
        "service": "labflow-backend",
        "version": settings.VERSION
    }


@app.get("/health/db", tags=["Health Check"])
def db_health_check():
    """Database connectivity health check endpoint"""
    try:
        from sqlalchemy import text
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "error", "database": str(e)}
        )


from fastapi import APIRouter

# Mount API V1 Routes
api_v1_router = APIRouter(prefix=settings.API_V1_STR)
api_v1_router.include_router(auth.router)
api_v1_router.include_router(users.router)
api_v1_router.include_router(patients.router)
api_v1_router.include_router(tests.router)
api_v1_router.include_router(orders.router)
api_v1_router.include_router(samples.router)
api_v1_router.include_router(results.router)
api_v1_router.include_router(reports.router)
api_v1_router.include_router(dashboard.router)
api_v1_router.include_router(notifications.router)
api_v1_router.include_router(audit.router)
api_v1_router.include_router(search.router)

app.include_router(api_v1_router)
