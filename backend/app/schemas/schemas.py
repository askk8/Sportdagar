from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, time, datetime
from enum import Enum
import uuid


class GenderType(str, Enum):
    pojke = "pojke"
    flicka = "flicka"
    annat = "annat"


class BookingStatus(str, Enum):
    confirmed = "confirmed"
    cancelled = "cancelled"
    waitlist = "waitlist"


# =============================================
# AUTH SCHEMAS
# =============================================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2, max_length=255)
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: Optional[str] = None
    is_admin: bool = False


# =============================================
# CHILD SCHEMAS
# =============================================

class ChildCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    birth_date: date
    gender: Optional[GenderType] = None
    medical_notes: Optional[str] = None
    emergency_contact_name: str = Field(min_length=2, max_length=255)
    emergency_contact_phone: str = Field(min_length=5, max_length=50)
    emergency_contact_relation: Optional[str] = None


class ChildUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    birth_date: Optional[date] = None
    gender: Optional[GenderType] = None
    medical_notes: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None


class ChildResponse(BaseModel):
    id: str
    parent_id: str
    full_name: str
    birth_date: date
    gender: Optional[GenderType] = None
    medical_notes: Optional[str] = None
    emergency_contact_name: str
    emergency_contact_phone: str
    emergency_contact_relation: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =============================================
# SPORT SCHEMAS
# =============================================

class SportResponse(BaseModel):
    id: str
    name: str
    icon: Optional[str] = None
    color: Optional[str] = None


# =============================================
# SPORT WEEK SCHEMAS
# =============================================

class SportWeekCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: Optional[str] = None
    start_date: date
    end_date: date
    location: Optional[str] = None
    image_url: Optional[str] = None
    is_published: bool = False


class SportWeekUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    is_published: Optional[bool] = None


class SportWeekResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    location: Optional[str] = None
    image_url: Optional[str] = None
    is_published: bool
    created_at: datetime
    updated_at: datetime


# =============================================
# SESSION SCHEMAS
# =============================================

class SessionCreate(BaseModel):
    sport_week_id: str
    sport_id: str
    title: str = Field(min_length=2, max_length=255)
    description: Optional[str] = None
    session_date: date
    start_time: time
    end_time: time
    location: Optional[str] = None
    min_age: int = Field(default=6, ge=0, le=18)
    max_age: int = Field(default=18, ge=0, le=18)
    max_capacity: int = Field(default=20, ge=1, le=200)
    is_active: bool = True


class SessionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    session_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    location: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    max_capacity: Optional[int] = None
    is_active: Optional[bool] = None


class SessionResponse(BaseModel):
    id: str
    sport_week_id: str
    sport_id: str
    title: str
    description: Optional[str] = None
    session_date: date
    start_time: str
    end_time: str
    location: Optional[str] = None
    min_age: int
    max_age: int
    max_capacity: int
    current_bookings: int
    is_active: bool
    spots_remaining: int
    sport: Optional[SportResponse] = None
    sport_week: Optional[SportWeekResponse] = None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_db(cls, data: dict) -> "SessionResponse":
        data["spots_remaining"] = max(0, data["max_capacity"] - data["current_bookings"])
        return cls(**data)


# =============================================
# BOOKING SCHEMAS
# =============================================

class BookingCreate(BaseModel):
    session_id: str
    child_id: str


class BookingResponse(BaseModel):
    id: str
    session_id: str
    child_id: str
    parent_id: str
    status: BookingStatus
    notes: Optional[str] = None
    booked_at: datetime
    cancelled_at: Optional[datetime] = None
    session: Optional[SessionResponse] = None
    child: Optional[ChildResponse] = None


# =============================================
# USER PROFILE SCHEMAS
# =============================================

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


class UserProfileResponse(BaseModel):
    id: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_admin: bool = False
    created_at: datetime
    updated_at: datetime


# =============================================
# GENERIC RESPONSE
# =============================================

class MessageResponse(BaseModel):
    message: str


class PaginatedResponse(BaseModel):
    data: list
    count: int
    page: int
    page_size: int
