from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from app.routes import persona, chat, memory, user
from app.database.connection import engine, Base
import os
import time
import logging

# Configure standard logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(),
        # Add FileHandler if persistent logs are needed in production
    ]
)
logger = logging.getLogger("api")

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Persona AI",
    description="Advanced AI Persona Chat Platform",
    version="1.0.0"
)

# Include Routers
app.include_router(persona.router)
app.include_router(chat.router)
app.include_router(memory.router)
app.include_router(user.router)

# CORS Middleware
# In production, change "*" to the specific frontend domain
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    if request.url.path == "/":
        return await call_next(request)

    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"{request.method} {request.url.path} - Status: {response.status_code} - Took: {process_time:.4f}s")
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(f"Unhandled error during {request.method} {request.url.path}: {str(e)}", exc_info=True)
        return Response(
            content=json.dumps({"success": False, "message": "An internal server error occurred."}), 
            status_code=500, 
            media_type="application/json"
        )

from fastapi.exceptions import RequestValidationError
import json

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error on {request.method} {request.url.path}: {exc.errors()}")
    return Response(
        content=json.dumps({"success": False, "message": "Invalid request parameters.", "detail": exc.errors()}),
        status_code=422,
        media_type="application/json"
    )

@app.get("/")
def root():
    return {"message": "AI Persona Chat API is running"}
