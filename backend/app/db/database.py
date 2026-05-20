from supabase import create_client, Client
from app.core.config import get_settings

settings = get_settings()

_supabase_client: Client | None = None
_supabase_admin_client: Client | None = None


def get_supabase() -> Client:
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(
            settings.supabase_url,
            settings.supabase_anon_key,
        )
    return _supabase_client


def get_supabase_admin() -> Client:
    """Admin client bypasses RLS - use only in admin routes."""
    global _supabase_admin_client
    if _supabase_admin_client is None:
        _supabase_admin_client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )
    return _supabase_admin_client
