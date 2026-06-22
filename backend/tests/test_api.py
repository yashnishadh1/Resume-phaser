from fastapi.testclient import TestClient
from app.main import app

from app.main import app

def test_read_main(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Resume Parser AI API"}

def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "newuser@example.com", "password": "SecureP@ssw0rd!", "full_name": "Test User", "company_name": "Test Co"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["email"] == "newuser@example.com"
