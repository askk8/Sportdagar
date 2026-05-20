from fastapi import APIRouter, HTTPException, Depends
from app.schemas.schemas import ChildCreate, ChildUpdate, ChildResponse
from app.db.database import get_supabase_admin
from app.core.auth import get_current_user

router = APIRouter(prefix="/children", tags=["children"])


@router.get("/", response_model=list[ChildResponse])
async def list_children(user=Depends(get_current_user)):
    admin = get_supabase_admin()
    result = admin.table("children").select("*").eq("parent_id", user.id).order("created_at").execute()
    return [ChildResponse(**c) for c in (result.data or [])]


@router.post("/", response_model=ChildResponse, status_code=201)
async def create_child(body: ChildCreate, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    data = body.model_dump()
    data["parent_id"] = user.id
    data["birth_date"] = str(data["birth_date"])
    if data.get("gender"):
        data["gender"] = data["gender"].value if hasattr(data["gender"], "value") else data["gender"]

    result = admin.table("children").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Could not create child")
    return ChildResponse(**result.data[0])


@router.get("/{child_id}", response_model=ChildResponse)
async def get_child(child_id: str, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    result = admin.table("children").select("*").eq("id", child_id).eq("parent_id", user.id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Child not found")
    return ChildResponse(**result.data)


@router.patch("/{child_id}", response_model=ChildResponse)
async def update_child(child_id: str, body: ChildUpdate, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    # Verify ownership
    existing = admin.table("children").select("id").eq("id", child_id).eq("parent_id", user.id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Child not found")

    update_data = body.model_dump(exclude_none=True)
    if "birth_date" in update_data:
        update_data["birth_date"] = str(update_data["birth_date"])
    if "gender" in update_data and update_data["gender"]:
        update_data["gender"] = update_data["gender"].value if hasattr(update_data["gender"], "value") else update_data["gender"]

    result = admin.table("children").update(update_data).eq("id", child_id).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Update failed")
    return ChildResponse(**result.data[0])


@router.delete("/{child_id}", status_code=204)
async def delete_child(child_id: str, user=Depends(get_current_user)):
    admin = get_supabase_admin()
    existing = admin.table("children").select("id").eq("id", child_id).eq("parent_id", user.id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Child not found")

    admin.table("children").delete().eq("id", child_id).execute()
