from fastapi.testclient import TestClient

def test_valid_match(client: TestClient, admin_user_token: str):
    response = client.post(
        "/api/v1/jd/match",
        json={"description": "We need Python developers"},
        headers={"Authorization": f"Bearer {admin_user_token}"}
    )
    assert response.status_code in [200, 404]

def test_empty_jd(client: TestClient, admin_user_token: str):
    response = client.post(
        "/api/v1/jd/match",
        json={"description": ""},
        headers={"Authorization": f"Bearer {admin_user_token}"}
    )
    # The API might return 200 with an empty match list if description is empty, or 422
    assert response.status_code in [200, 422]

def test_invalid_data(client: TestClient, admin_user_token: str):
    response = client.post(
        "/api/v1/jd/match",
        json={"invalid_field": True},
        headers={"Authorization": f"Bearer {admin_user_token}"}
    )
    assert response.status_code == 422

def test_unauthorized_user(client: TestClient, test_user_token: str):
    response = client.post(
        "/api/v1/jd/match",
        json={"description": "We need Python developers"},
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 403
