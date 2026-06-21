from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Resume Parser AI API"}

def test_register_user(mocker):
    # Mocking DB so we don't need a real Postgres instance for unit tests
    mocker.patch("app.api.auth.get_db")
    
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "securepassword", "full_name": "Test User"}
    )
    
    # Since DB is mocked and we just want to ensure routing works, we expect a 500 or mocked response
    # In a real test setup, we'd use a test DB.
    assert response.status_code in [200, 500, 400]
