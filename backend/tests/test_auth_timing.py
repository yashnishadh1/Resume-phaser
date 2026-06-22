import time
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.database import Base, get_db
from app.models.user import User
from app.core import security

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_timing.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    db = TestingSessionLocal()
    # Ensure clean state
    db.query(User).delete()
    
    # Valid active user
    active_user = User(
        email="valid@example.com",
        hashed_password=security.get_password_hash("password123"),
        is_active=True
    )
    db.add(active_user)
    
    # Inactive user
    inactive_user = User(
        email="disabled@example.com",
        hashed_password=security.get_password_hash("password123"),
        is_active=False
    )
    db.add(inactive_user)
    
    db.commit()
    db.close()

def measure_login_time(email, password):
    start = time.perf_counter()
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    duration = time.perf_counter() - start
    return response, duration

def test_login_timing():
    # Warmup
    measure_login_time("valid@example.com", "password123")
    
    # 1. Valid user, wrong password
    resp1, time_wrong_pwd = measure_login_time("valid@example.com", "wrongpassword")
    assert resp1.status_code == 400
    
    # 2. Invalid user
    resp2, time_invalid_user = measure_login_time("doesnotexist@example.com", "wrongpassword")
    assert resp2.status_code == 400
    
    # 3. Disabled user
    resp3, time_disabled = measure_login_time("disabled@example.com", "wrongpassword")
    assert resp3.status_code == 400
    
    print(f"\\nTimings:")
    print(f"Valid user (wrong pwd): {time_wrong_pwd:.4f}s")
    print(f"Invalid user:           {time_invalid_user:.4f}s")
    print(f"Disabled user:          {time_disabled:.4f}s")
    
    # The timings should be within a reasonable tolerance (e.g. 50ms)
    # The max difference should be significantly less than the hashing time itself (~100ms)
    max_diff = max(abs(time_wrong_pwd - time_invalid_user), abs(time_wrong_pwd - time_disabled))
    assert max_diff < 0.1, f"Timing difference too large: {max_diff}s"
