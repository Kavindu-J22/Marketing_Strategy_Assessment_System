"""
Unit & Security Tests for Authentication, Multi-Tenant Scoping, and RBAC
Validates Better Auth session extraction, role checks, and tenant isolation guards.
"""
import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException
from app.core.security import (
    AuthUser,
    get_current_user,
    require_role,
    require_tenant
)


def test_dev_mode_fallback_user():
    """Verifies that an unauthenticated request in dev mode returns the safe dev profile."""
    mock_request = MagicMock()
    mock_request.cookies = {}
    mock_request.headers = {}

    user = get_current_user(request=mock_request, credentials=None)
    assert isinstance(user, AuthUser)
    assert user.is_authenticated is True
    assert user.user_id == "demo-user-dev-001"
    assert user.organization_id == "org-ceylontech-001"


def test_require_role_permitted():
    """Verifies that users with permitted roles pass check."""
    user = AuthUser(user_id="u1", email="a@b.com", role="admin", organization_id="org-1")
    checker = require_role(["admin", "researcher"])
    checked_user = checker(current_user=user)
    assert checked_user == user


def test_require_role_forbidden():
    """Verifies that users lacking required roles receive 403 Forbidden."""
    user = AuthUser(user_id="u2", email="m@b.com", role="member", organization_id="org-1")
    checker = require_role(["admin", "researcher"])

    with pytest.raises(HTTPException) as exc_info:
        checker(current_user=user)
    assert exc_info.value.status_code == 403


def test_require_tenant_isolation_permitted():
    """Verifies that a user accessing their own tenant is granted access."""
    user = AuthUser(user_id="u3", email="user@org.lk", role="member", organization_id="org-alpha")
    tenant_guard = require_tenant("org-alpha")
    guarded_user = tenant_guard(current_user=user)
    assert guarded_user == user


def test_require_tenant_isolation_blocked():
    """Verifies that attempting cross-tenant access is rejected with 403."""
    user = AuthUser(user_id="u4", email="user@org.lk", role="member", organization_id="org-alpha")
    tenant_guard = require_tenant("org-beta") # Different tenant

    with pytest.raises(HTTPException) as exc_info:
        tenant_guard(current_user=user)
    assert exc_info.value.status_code == 403
    assert "Cross-tenant access prohibited" in exc_info.value.detail
