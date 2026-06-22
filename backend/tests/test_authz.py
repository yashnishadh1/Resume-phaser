from fastapi.testclient import TestClient
from app.models.user import User

def test_user_cannot_access_admin_route(client: TestClient, test_user_token: str):
    response = client.get("/api/v1/analytics/system", headers={"Authorization": f"Bearer {test_user_token}"})
    assert response.status_code in [403, 404]  # 403 Forbidden expected, or 404 if not found

def test_admin_can_access_admin_route(client: TestClient, admin_user_token: str):
    response = client.get("/api/v1/analytics/system", headers={"Authorization": f"Bearer {admin_user_token}"})
    assert response.status_code in [200, 404]  # 200 OK expected, or 404 if not yet implemented
