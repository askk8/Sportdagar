from fastapi import APIRouter, HTTPException, Depends, Query
from app.schemas.schemas import SessionResponse, SportResponse, SportWeekResponse
from app.db.database import get_supabase_admin
from app.core.auth import get_current_user
from typing import Optional
from datetime import date

router = APIRouter(prefix="/sessions", tags=["sessions"])


def build_session_response(s: dict) -> dict:
    s["spots_remaining"] = max(0, s["max_capacity"] - s["current_bookings"])
    s["start_time"] = str(s["start_time"]) if s.get("start_time") else s["start_time"]
    s["end_time"] = str(s["end_time"]) if s.get("end_time") else s["end_time"]
    return s


@router.get("/", response_model=list[SessionResponse])
async def list_sessions(
    sport_week_id: Optional[str] = Query(None),
    sport_id: Optional[str] = Query(None),
    session_date: Optional[date] = Query(None),
    min_age: Optional[int] = Query(None),
    max_age: Optional[int] = Query(None),
):
    admin = get_supabase_admin()
    query = admin.table("sessions").select(
        "*, sports(*), sport_weeks(*)"
    ).eq("is_active", True)

    if sport_week_id:
        query = query.eq("sport_week_id", sport_week_id)
    if sport_id:
        query = query.eq("sport_id", sport_id)
    if session_date:
        query = query.eq("session_date", str(session_date))
    if min_age is not None:
        query = query.gte("max_age", min_age)
    if max_age is not None:
        query = query.lte("min_age", max_age)

    result = query.order("session_date").order("start_time").execute()

    sessions = []
    for s in (result.data or []):
        sport_data = s.pop("sports", None)
        week_data = s.pop("sport_weeks", None)
        s = build_session_response(s)
        session = SessionResponse(**s)
        if sport_data:
            session.sport = SportResponse(**sport_data)
        if week_data:
            session.sport_week = SportWeekResponse(**week_data)
        sessions.append(session)

    return sessions


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str):
    admin = get_supabase_admin()
    result = admin.table("sessions").select("*, sports(*), sport_weeks(*)").eq("id", session_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")

    s = result.data
    sport_data = s.pop("sports", None)
    week_data = s.pop("sport_weeks", None)
    s = build_session_response(s)
    session = SessionResponse(**s)
    if sport_data:
        session.sport = SportResponse(**sport_data)
    if week_data:
        session.sport_week = SportWeekResponse(**week_data)
    return session


@router.get("/weeks/", response_model=list[SportWeekResponse])
async def list_sport_weeks():
    admin = get_supabase_admin()
    result = admin.table("sport_weeks").select("*").eq("is_published", True).order("start_date").execute()
    return [SportWeekResponse(**w) for w in (result.data or [])]


@router.get("/sports/", response_model=list[SportResponse])
async def list_sports():
    admin = get_supabase_admin()
    result = admin.table("sports").select("*").order("name").execute()
    return [SportResponse(**s) for s in (result.data or [])]
