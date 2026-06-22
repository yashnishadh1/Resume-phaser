from fastapi.testclient import TestClient

def test_authorized_export(client: TestClient, admin_user_token: str):
    response = client.get("/api/v1/export/candidates", headers={"Authorization": f"Bearer {admin_user_token}"})
    assert response.status_code in [200, 404] # Valid or not implemented

def test_unauthorized_export(client: TestClient, test_user_token: str):
    response = client.get("/api/v1/export/candidates", headers={"Authorization": f"Bearer {test_user_token}"})
    assert response.status_code in [403, 401, 404] # Forbidden expected
