from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.schemas import RegisterRequest, LoginRequest, AuthResponse, UserProfileUpdate, UserProfileResponse
from app.db.database import get_supabase, get_supabase_admin
from app.core.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
async def register(body: RegisterRequest):
    supabase = get_supabase()
    try:
        response = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {
                "data": {
                    "full_name": body.full_name,
                    "phone": body.phone,
                }
            }
        })
        if not response.user:
            raise HTTPException(status_code=400, detail="Registration failed")

        # Update profile with phone if provided
        if body.phone:
            admin = get_supabase_admin()
            admin.table("user_profiles").update({"phone": body.phone}).eq("id", response.user.id).execute()

        return AuthResponse(
            access_token=response.session.access_token if response.session else "",
            user_id=response.user.id,
            email=response.user.email,
            full_name=body.full_name,
            is_admin=False,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    supabase = get_supabase()
    try:
        response = supabase.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password,
        })
        if not response.user or not response.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        admin = get_supabase_admin()
        profile = admin.table("user_profiles").select("*").eq("id", response.user.id).single().execute()
        profile_data = profile.data or {}

        return AuthResponse(
            access_token=response.session.access_token,
            user_id=response.user.id,
            email=response.user.email,
            full_name=profile_data.get("full_name"),
            is_admin=profile_data.get("is_admin", False),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/logout")
async def logout(user=Depends(get_current_user)):
    supabase = get_supabase()
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception:
        return {"message": "Logged out"}


@router.get("/me", response_model=UserProfileResponse)
async def get_me(user=Depends(get_current_user)):
    admin = get_supabase_admin()
    profile = admin.table("user_profiles").select("*").eq("id", user.id).single().execute()
    if not profile.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return UserProfileResponse(**profile.data)


@router.patch("/me", response_model=UserProfileResponse)
async def update_me(body: UserProfileUpdate, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    update_data = body.model_dump(exclude_none=True)
    result = admin.table("user_profiles").update(update_data).eq("id", user.id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return UserProfileResponse(**result.data[0])
