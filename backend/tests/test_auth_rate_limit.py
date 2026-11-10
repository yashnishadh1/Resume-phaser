from fastapi.testclient import TestClient
from redis.exceptions import ConnectionError as RedisConnectionError
from app.core.config import settings


def test_auth_endpoint_returns_429_after_rate_limit(client: TestClient, monkeypatch):
    monkeypatch.setattr(settings, "AUTH_RATE_LIMIT_ENABLED", True)
    monkeypatch.setattr("app.main.increment_auth_rate_limit", lambda _key, _window: 6)
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "person@example.com", "password": "incorrect"},
    )
    assert response.status_code == 429
    assert response.headers["retry-after"] == str(settings.AUTH_RATE_LIMIT_WINDOW_SECONDS)


def test_auth_fails_closed_when_redis_rate_limiter_is_unavailable(client: TestClient, monkeypatch):
    monkeypatch.setattr(settings, "AUTH_RATE_LIMIT_ENABLED", True)

    def unavailable(_key: str, _window: int) -> int:
        raise RedisConnectionError("Redis unavailable")

    monkeypatch.setattr("app.main.increment_auth_rate_limit", unavailable)
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "person@example.com", "password": "incorrect"},
    )
    assert response.status_code == 503
    assert response.json()["detail"] == "Authentication service is temporarily unavailable"
