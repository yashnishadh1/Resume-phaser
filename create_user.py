import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.db.database import SessionLocal, engine, Base
from app.models.user import User
import bcrypt

def create_test_user():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Delete old user with slow hash
    db.query(User).filter(User.email == "test@example.com").delete()
    db.commit()

    # Recreate with fast hash (rounds=4)
    hashed_password = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt(rounds=4)).decode('utf-8')
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
