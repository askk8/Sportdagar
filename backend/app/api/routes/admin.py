from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from app.schemas.schemas import (
    SportWeekCreate, SportWeekUpdate, SportWeekResponse,
    SessionCreate, SessionUpdate, SessionResponse, SportResponse,
    BookingResponse, ChildResponse,
)
from app.db.database import get_supabase_admin
from app.core.admin_auth import get_admin_from_token, ADMIN_TOKEN, ADMIN_USERNAME, ADMIN_PASSWORD
from typing import Optional

router = APIRouter(prefix="/admin", tags=["admin"])


# =============================================
# ADMIN AUTH
# =============================================

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class AdminLoginResponse(BaseModel):
    token: str
    username: str

@router.post("/auth/login", response_model=AdminLoginResponse)
def admin_login(body: AdminLoginRequest):
    if body.username != ADMIN_USERNAME or body.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Ogiltiga inloggningsuppgifter")
    return AdminLoginResponse(token=ADMIN_TOKEN, username=ADMIN_USERNAME)


# =============================================
# SPORT WEEKS
# =============================================

@router.get("/weeks", response_model=list[SportWeekResponse])
def admin_list_weeks(admin=Depends(get_admin_from_token)):
    db = get_supabase_admin()
    result = db.table("sport_weeks").select("*").order("start_date").execute()
    return [SportWeekResponse(**w) for w in (result.data or [])]


@router.post("/weeks", response_model=SportWeekResponse, status_code=201)
def admin_create_week(body: SportWeekCreate, admin=Depends(get_admin_from_token)):
    db = get_supabase_admin()
    data = body.model_dump()
    data["start_date"] = str(data["start_date"])
    data["end_date"] = str(data["end_date"])
    result = db.table("sport_weeks").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Kunde inte skapa vecka")
    return SportWeekResponse(**result.data[0])


@router.patch("/weeks/{week_id}", response_model=SportWeekResponse)
def admin_update_week(week_id: str, body: SportWeekUpdate, admin=Depends(get_admin_from_token)):
    db = get_supabase_admin()
    update_data = body.model_dump(exclude_none=True)
    if "start_date" in update_data:
        update_data["start_date"] = str(update_data["start_date"])
    if "end_date" in update_data:
        update_data["end_date"] = str(update_data["end_date"])
    result = db.table("sport_weeks").update(update_data).eq("id", week_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Vecka ej hittad")
    return SportWeekResponse(**result.data[0])


@router.delete("/weeks/{week_id}", status_code=204)
def admin_delete_week(week_id: str, admin=Depends(get_admin_from_token)):
    db = get_supabase_admin()
    db.table("sport_weeks").delete().eq("id", week_id).execute()


# =============================================
# SESSIONS
# =============================================

@router.get("/sessions", response_model=list[SessionResponse])
def admin_list_sessions(
    sport_week_id: Optional[str] = Query(None),
    admin=Depends(get_admin_from_token)
):
    db = get_supabase_admin()
    query = db.table("sessions").select("*, sports(*), sport_weeks(*)")
    if sport_week_id:
        query = query.eq("sport_week_id", sport_week_id)
    result = query.order("session_date").order("start_time").execute()

    sessions = []
    for s in (result.data or []):
        sport_data = s.pop("sports", None)
        week_data = s.pop("sport_weeks", None)
        s["spots_remaining"] = max(0, s["max_capacity"] - s["current_bookings"])
        s["start_time"] = str(s.get("start_time", ""))
        s["end_time"] = str(s.get("end_time", ""))
        session = SessionResponse(**s)
        if sport_data:
            session.sport = SportResponse(**sport_data)
        if week_data:
            session.sport_week = SportWeekResponse(**week_data)
        sessions.append(session)
    return sessions


@router.post("/sessions", response_model=SessionResponse, status_code=201)
def admin_create_session(body: SessionCreate, admin=Depends(get_admin_from_token)):
    db = get_supabase_admin()
    data = body.model_dump()
    data["session_date"] = str(data["session_date"])
    data["start_time"] = str(data["start_time"])
    data["end_time"] = str(data["end_time"])
    result = db.table("sessions").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Kunde inte skapa session")
    s = result.data[0]
    s["spots_remaining"] = max(0, s["max_capacity"] - s["current_bookings"])
    return SessionResponse(**s)


@router.patch("/sessions/{session_id}", response_model=SessionResponse)
def admin_update_session(session_id: str, body: SessionUpdate, admin=Depends(get_admin_from_token)):
    db = get_supabase_admin()
    update_data = body.model_dump(exclude_none=True)
    if "session_date" in update_data:
        update_data["session_date"] = str(update_data["session_date"])
    if "start_time" in update_data:
        update_data["start_time"] = str(update_data["start_time"])
    if "end_time" in update_data:
        update_data["end_time"] = str(update_data["end_time"])
    result = db.table("sessions").update(update_data).eq("id", session_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Session ej hittad")
    s = result.data[0]
    s["spots_remaining"] = max(0, s["max_capacity"] - s["current_bookings"])
    return SessionResponse(**s)


@router.delete("/sessions/{session_id}", status_code=204)
def admin_delete_session(session_id: str, admin=Depends(get_admin_from_token)):
    db = get_supabase_admin()
    db.table("sessions").delete().eq("id", session_id).execute()


# =============================================
# BOOKINGS
# =============================================

@router.get("/bookings", response_model=list[BookingResponse])
def admin_list_bookings(
    session_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    admin=Depends(get_admin_from_token)
):
    db = get_supabase_admin()
    query = db.table("bookings").select("*, sessions(*, sports(*)), children(*)")
    if session_id:
        query = query.eq("session_id", session_id)
    if status:
        query = query.eq("status", status)
    result = query.order("booked_at", desc=True).execute()

    bookings = []
    for b in (result.data or []):
        session_data = b.pop("sessions", None)
        child_data = b.pop("children", None)
        booking = BookingResponse(**b)
        if session_data:
            sport_data = session_data.pop("sports", None)
            session_data["spots_remaining"] = max(0, session_data["max_capacity"] - session_data["current_bookings"])
            session_data["start_time"] = str(session_data.get("start_time", ""))
            session_data["end_time"] = str(session_data.get("end_time", ""))
            session = SessionResponse(**session_data)
            if sport_data:
                session.sport = SportResponse(**sport_data)
            booking.session = session
        if child_data:
            booking.child = ChildResponse(**child_data)
        bookings.append(booking)
    return bookings


# =============================================
# SPORTS
# =============================================

@router.get("/sports", response_model=list[SportResponse])
def admin_list_sports(admin=Depends(get_admin_from_token)):
    db = get_supabase_admin()
    result = db.table("sports").select("*").order("name").execute()
    return [SportResponse(**s) for s in (result.data or [])]


# =============================================
# STATS
# =============================================

@router.get("/stats")
def admin_get_stats(admin=Depends(get_admin_from_token)):
    db = get_supabase_admin()
    weeks = db.table("sport_weeks").select("id", count="exact").execute()
    sessions = db.table("sessions").select("id", count="exact").execute()
    bookings = db.table("bookings").select("id", count="exact").eq("status", "confirmed").execute()
    children = db.table("children").select("id", count="exact").execute()
    users = db.table("user_profiles").select("id", count="exact").execute()

    return {
        "total_sport_weeks": weeks.count or 0,
        "total_sessions": sessions.count or 0,
        "total_confirmed_bookings": bookings.count or 0,
        "total_children": children.count or 0,
        "total_users": users.count or 0,
    }
