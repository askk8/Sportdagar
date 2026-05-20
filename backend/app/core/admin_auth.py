import hmac
import hashlib
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Hardcoded admin credentials
ADMIN_USERNAME = "User"
ADMIN_PASSWORD = "Password"
# Simple static token derived from credentials — good enough for MVP
ADMIN_TOKEN = hashlib.sha256(f"{ADMIN_USERNAME}:{ADMIN_PASSWORD}:sportdagar-secret".encode()).hexdigest()

security = HTTPBearer()


def get_admin_from_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not hmac.compare_digest(credentials.credentials, ADMIN_TOKEN):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin token")
    return {"username": ADMIN_USERNAME}
