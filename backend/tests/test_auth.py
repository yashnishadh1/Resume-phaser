from fastapi.testclient import TestClient
import time
from app.core.security import get_password_hash
from app.models.user import User

def test_login_success(client: TestClient, test_user: User):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "testpassword"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

def test_login_failure(client: TestClient, test_user: User):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "wrongpassword"}
    )
    assert response.status_code == 400

def test_invalid_jwt(client: TestClient):
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid_token"})
    assert response.status_code == 401

def test_refresh_token_flow(client: TestClient, test_user: User):
    # First login to get a refresh token
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "testpassword"}
    )
    refresh_token = login_response.json()["refresh_token"]

    # Now refresh
    refresh_response = client.post(
        "/api/v1/auth/refresh", json={"refresh_token": refresh_token}
    )
    assert refresh_response.status_code == 200
    assert "access_token" in refresh_response.json()

def test_logout(client: TestClient, test_user: User):
    # Login to get a refresh token
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "testpassword"}
    )
    refresh_token = login_response.json()["refresh_token"]

    # Logout
    logout_response = client.post(
        "/api/v1/auth/logout", json={"refresh_token": refresh_token}
    )
    assert logout_response.status_code == 200

    # Try to refresh with the logged-out token
    refresh_response = client.post(
        "/api/v1/auth/refresh", json={"refresh_token": refresh_token}
    )
    assert refresh_response.status_code == 401


def test_user_can_update_own_profile(client: TestClient, test_user: User, test_user_token: str):
    response = client.patch(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={"full_name": "Updated Name"},
    )
    assert response.status_code == 200
    assert response.json()["full_name"] == "Updated Name"


def test_profile_update_rejects_blank_name(client: TestClient, test_user_token: str):
    response = client.patch(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={"full_name": "   "},
    )
    assert response.status_code == 422


def test_password_change_checks_current_password(client: TestClient, test_user_token: str):
    response = client.post(
        "/api/v1/auth/password",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={"current_password": "wrong-password", "new_password": "StrongP@ssw0rd1"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Current password is incorrect"


def test_password_change_revokes_refresh_tokens(client: TestClient, test_user: User):
    login = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "testpassword"},
    )
    assert login.status_code == 200
    refresh_token = login.json()["refresh_token"]
    changed = client.post(
        "/api/v1/auth/password",
        headers={"Authorization": f"Bearer {login.json()['access_token']}"},
        json={"current_password": "testpassword", "new_password": "StrongP@ssw0rd1"},
    )
    assert changed.status_code == 200
    refresh = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh.status_code == 401
