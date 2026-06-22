import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.db.database import SessionLocal, engine, Base
from app.models.user import User
from app.core import security

def create_test_user():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Delete old user
    db.query(User).filter(User.email == "test@example.com").delete()
    db.commit()

    hashed_password = security.get_password_hash("password123")
    user = User(
        email="test@example.com",
        hashed_password=hashed_password,
        full_name="Test User",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print("Created test user: test@example.com / password123 with fast hash!")
    
    db.close()

if __name__ == "__main__":
    create_test_user()
