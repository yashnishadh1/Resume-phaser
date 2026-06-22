import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, pool
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.database import Base, get_db
from app.models.user import User, Role
from app.core.security import get_password_hash, create_access_token
import uuid
from sqlalchemy import event

# Setup test database (in-memory SQLite for tests)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=pool.StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db_engine():
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db_engine):
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    # Enable nested transactions for savepoints
    session.begin_nested()
    
    @event.listens_for(session, "after_transaction_end")
    def restart_savepoint(session, transaction):
        # Restart savepoint when a commit is made by the application
        if transaction.nested and not transaction._parent.nested:
            session.begin_nested()
            
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def test_user(db_session):
    uid = uuid.uuid4().hex
    user = User(
        email=f"testuser_{uid}@example.com",
        hashed_password=get_password_hash("testpassword"),
        full_name="Test User",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    return user

@pytest.fixture(scope="function")
def admin_role(db_session):
    role = db_session.query(Role).filter(Role.name == "Admin").first()
    if not role:
        role = Role(name="Admin")
        db_session.add(role)
        db_session.commit()
    return role

@pytest.fixture(scope="function")
def admin_user(db_session, admin_role):
    uid = uuid.uuid4().hex
    user = User(
        email=f"admin_{uid}@example.com",
        hashed_password=get_password_hash("adminpassword"),
        full_name="Admin User",
        is_active=True,
        role_id=admin_role.id
    )
    db_session.add(user)
    db_session.commit()
    return user

@pytest.fixture(scope="function")
def test_user_token(test_user):
    return create_access_token(subject=test_user.id)

@pytest.fixture(scope="function")
def admin_user_token(admin_user):
    return create_access_token(subject=admin_user.id)
