import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

from app.main import app
from app.db.database import Base, get_db
from app.models.user import User

from app.core import security

def test_password_migration(client, db_session):
    import bcrypt
    # 1. Setup a user with a legacy bcrypt hash
    # clean up if exist
    db_session.query(User).filter(User.email == "legacy@example.com").delete()
    
    # Hash password explicitly with bcrypt
    legacy_hash = bcrypt.hashpw("password123".encode(), bcrypt.gensalt(rounds=4)).decode()
    assert legacy_hash.startswith("$2b$") or legacy_hash.startswith("$2a$")
    
    user = User(
        email="legacy@example.com",
        hashed_password=legacy_hash,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # 2. Login with legacy user (should succeed and trigger migration)
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "legacy@example.com", "password": "password123"}
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data

    # 3. Verify the hash was upgraded to Argon2
    updated_user = db_session.query(User).filter(User.email == "legacy@example.com").first()
    
    # Argon2 hashes typically start with $argon2
    assert updated_user.hashed_password.startswith("$argon2")
    assert not updated_user.hashed_password.startswith("$2b$")

    # 4. Subsequent login should still work with the new Argon2 hash
    response_again = client.post(
        "/api/v1/auth/login",
        json={"email": "legacy@example.com", "password": "password123"}
    )
    assert response_again.status_code == 200
    assert "access_token" in response_again.json()
