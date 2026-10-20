"""
Authentication, Token Verification and Role-Based Access Control
"""
from typing import Optional, Dict, Any, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel
from app.core.config import settings
from app.core.logging import logger

security_scheme = HTTPBearer(auto_error=False)


class AuthUser(BaseModel):
    user_id: str
    email: str
    role: str = "member" # 'admin', 'researcher', 'expert', 'member'
    organization_id: Optional[str] = "00000000-0000-0000-0000-000000000001"
    is_authenticated: bool = True


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> AuthUser:
    """
    Extracts and validates the authenticated user from Supabase Bearer JWT.
    Supports a transparent, reproducible development/evaluation mode when offline.
    """
    if not credentials:
        if settings.ENVIRONMENT in ["development", "evaluation"] and settings.DEBUG:
            # Fallback mock user for dev/testing when unauthenticated
            return AuthUser(
                user_id="demo-user-dev-001",
                email="founder@ceylontech.lk",
                role="admin",
                organization_id="org-ceylontech-001",
                is_authenticated=True
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # If Supabase JWT Secret is configured, verify signature
    if settings.SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            user_id: str = payload.get("sub") or payload.get("id")
            email: str = payload.get("email", "unknown@user.lk")
            role: str = payload.get("role", "member")
            # Custom claim or app_metadata if provided
            user_metadata = payload.get("user_metadata", {})
            org_id = user_metadata.get("organization_id", "org-ceylontech-001")
            system_role = user_metadata.get("system_role", role)

            return AuthUser(
                user_id=user_id,
                email=email,
                role=system_role,
                organization_id=org_id,
                is_authenticated=True
            )
        except JWTError as e:
            logger.warning(f"JWT Verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid or expired token: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )
    else:
        # Development / Unverified Decode Mode
        try:
            unverified_claims = jwt.get_unverified_claims(token)
            return AuthUser(
                user_id=unverified_claims.get("sub", "dev-user-001"),
                email=unverified_claims.get("email", "dev@ceylontech.lk"),
                role=unverified_claims.get("role", "admin"),
                organization_id=unverified_claims.get("org_id", "org-ceylontech-001"),
                is_authenticated=True
            )
        except Exception:
            # Fallback for simple testing strings like "Bearer dev-token"
            return AuthUser(
                user_id="dev-user-001",
                email="dev@ceylontech.lk",
                role="admin",
                organization_id="org-ceylontech-001",
                is_authenticated=True
            )


def require_role(allowed_roles: List[str]):
    """
    Dependency factory to enforce specific system or organization roles.
    """
    def role_checker(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation requires one of the following roles: {allowed_roles}. Current role: {current_user.role}"
            )
        return current_user
    return role_checker
