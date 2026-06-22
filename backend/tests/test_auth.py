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
        f"/api/v1/auth/refresh?refresh_token={refresh_token}"
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
    logout_response = client.post(f"/api/v1/auth/logout?refresh_token={refresh_token}")
    assert logout_response.status_code == 200

    # Try to refresh with the logged-out token
    refresh_response = client.post(f"/api/v1/auth/refresh?refresh_token={refresh_token}")
    assert refresh_response.status_code == 401
