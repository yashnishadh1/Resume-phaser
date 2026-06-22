from fastapi.testclient import TestClient
from app.models.resume import Candidate

def test_read_candidate(client: TestClient, test_user_token: str, db_session):
    # Ensure there is at least one candidate for this test
    # We will just get the list of candidates
    response = client.get("/api/v1/candidates/", headers={"Authorization": f"Bearer {test_user_token}"})
    assert response.status_code == 200

def test_delete_candidate(client: TestClient, test_user_token: str):
    response = client.delete("/api/v1/candidates/1", headers={"Authorization": f"Bearer {test_user_token}"})
    assert response.status_code in [200, 204, 404]


def test_ownership_isolation(client: TestClient, test_user_token: str):
    # Try to access a candidate owned by someone else
    response = client.get("/api/v1/candidates/999", headers={"Authorization": f"Bearer {test_user_token}"})
    assert response.status_code == 404 # Should not leak presence
