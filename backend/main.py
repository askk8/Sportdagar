from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.routes import auth, children, sessions, bookings, admin

settings = get_settings()

app = FastAPI(
    title="Sportdagar API",
    description="Backend API for the Sportdagar platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(children.router, prefix="/api/v1")
app.include_router(sessions.router, prefix="/api/v1")
app.include_router(bookings.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Sportdagar API"}
