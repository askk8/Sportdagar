from fastapi import APIRouter, HTTPException, Depends
from app.schemas.schemas import BookingCreate, BookingResponse, SessionResponse, ChildResponse, SportResponse
from app.db.database import get_supabase_admin
from app.core.auth import get_current_user

router = APIRouter(prefix="/bookings", tags=["bookings"])


def build_session(s: dict) -> SessionResponse:
    sport_data = s.pop("sports", None)
    s["spots_remaining"] = max(0, s["max_capacity"] - s["current_bookings"])
    s["start_time"] = str(s.get("start_time", ""))
    s["end_time"] = str(s.get("end_time", ""))
    session = SessionResponse(**s)
    if sport_data:
        session.sport = SportResponse(**sport_data)
    return session


@router.get("/", response_model=list[BookingResponse])
async def list_my_bookings(user=Depends(get_current_user)):
    admin = get_supabase_admin()
    result = admin.table("bookings").select(
        "*, sessions(*, sports(*)), children(*)"
    ).eq("parent_id", user.id).order("booked_at", desc=True).execute()

    bookings = []
    for b in (result.data or []):
        session_data = b.pop("sessions", None)
        child_data = b.pop("children", None)
        booking = BookingResponse(**b)
        if session_data:
            booking.session = build_session(session_data)
        if child_data:
            booking.child = ChildResponse(**child_data)
        bookings.append(booking)
    return bookings


@router.post("/", response_model=BookingResponse, status_code=201)
async def create_booking(body: BookingCreate, user=Depends(get_current_user)):
    admin = get_supabase_admin()

    # Call the safe booking stored procedure that handles locking/race conditions
    result = admin.rpc("create_booking", {
        "p_session_id": body.session_id,
        "p_child_id": body.child_id,
        "p_parent_id": user.id,
    }).execute()

    response_data = result.data
    if isinstance(response_data, list):
        response_data = response_data[0]

    if not response_data.get("success"):
        raise HTTPException(status_code=400, detail=response_data.get("error", "Booking failed"))

    booking_id = response_data["booking_id"]
    booking_result = admin.table("bookings").select(
        "*, sessions(*, sports(*)), children(*)"
    ).eq("id", booking_id).single().execute()

    b = booking_result.data
    session_data = b.pop("sessions", None)
    child_data = b.pop("children", None)
    booking = BookingResponse(**b)
    if session_data:
        booking.session = build_session(session_data)
    if child_data:
        booking.child = ChildResponse(**child_data)
    return booking


@router.delete("/{booking_id}", status_code=200)
async def cancel_booking(booking_id: str, user=Depends(get_current_user)):
    admin = get_supabase_admin()

    result = admin.rpc("cancel_booking", {
        "p_booking_id": booking_id,
        "p_parent_id": user.id,
    }).execute()

    response_data = result.data
    if isinstance(response_data, list):
        response_data = response_data[0]

    if not response_data.get("success"):
        raise HTTPException(status_code=400, detail=response_data.get("error", "Cancel failed"))

    return {"message": "Bokning avbokad"}
