from fastapi.testclient import TestClient
from app.models.user import User

def test_user_can_access_scoped_dashboard_analytics(client: TestClient, test_user_token: str):
    response = client.get("/api/v1/analytics/dashboard", headers={"Authorization": f"Bearer {test_user_token}"})
    assert response.status_code == 200
    assert response.json()["total_candidates"] == 0
    assert response.json()["avg_match_score"] is None
    assert response.json()["top_skills"] == []

def test_admin_can_access_admin_route(client: TestClient, admin_user_token: str):
    response = client.get("/api/v1/analytics/dashboard", headers={"Authorization": f"Bearer {admin_user_token}"})
    assert response.status_code == 200
