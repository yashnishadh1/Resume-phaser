from fastapi.testclient import TestClient


def test_admin_can_export_candidates(client: TestClient, admin_user_token: str):
    response = client.get(
        "/api/v1/export/csv",
        headers={"Authorization": f"Bearer {admin_user_token}"},
    )
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert response.text.startswith("ID,Name,Email,Phone,Location,Summary")


def test_user_can_export_workspace_candidates(client: TestClient, test_user_token: str):
    response = client.get(
        "/api/v1/export/csv",
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]


def test_export_requires_authentication(client: TestClient):
    response = client.get("/api/v1/export/csv")
    assert response.status_code == 401
