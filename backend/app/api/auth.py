from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.db.database import get_db
from app.core import security
from app.core.config import settings
from app.models.user import User, RefreshToken
from app.schemas.user import UserCreate, UserResponse, Token, UserLogin
from app.api import deps
import secrets
from datetime import datetime, timezone
import hashlib

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        company_name=user_in.company_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    
    if not user:
        # Perform a dummy verification to mitigate timing attacks
        security.verify_password(user_in.password, security.DUMMY_PASSWORD_HASH)
        authenticated = False
    else:
        authenticated = security.verify_password(user_in.password, user.hashed_password)
        
    if not authenticated:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    if security.needs_password_update(user.hashed_password):
        user.hashed_password = security.get_password_hash(user_in.password)
        db.commit()
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    
    refresh_token_str = secrets.token_urlsafe(32)
    refresh_token_expires = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    refresh_token_db = RefreshToken(
        token=hashlib.sha256(refresh_token_str.encode()).hexdigest(),
        user_id=user.id,
        expires_at=refresh_token_expires
    )
    db.add(refresh_token_db)
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token_str
    }

@router.post("/refresh", response_model=Token)
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    hashed_token = hashlib.sha256(refresh_token.encode()).hexdigest()
    db_token = db.query(RefreshToken).filter(RefreshToken.token == hashed_token).first()
    
    if not db_token or db_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        if db_token:
            db.delete(db_token)
            db.commit()
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
        
    user = db.query(User).filter(User.id == db_token.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User is inactive or deleted")
        
    # Rotate token
    db.delete(db_token)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    
    new_refresh_token_str = secrets.token_urlsafe(32)
    new_refresh_token_expires = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    new_db_token = RefreshToken(
        token=hashlib.sha256(new_refresh_token_str.encode()).hexdigest(),
        user_id=user.id,
        expires_at=new_refresh_token_expires
    )
    db.add(new_db_token)
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": new_refresh_token_str
    }

@router.post("/logout")
def logout(refresh_token: str, db: Session = Depends(get_db)):
    hashed_token = hashlib.sha256(refresh_token.encode()).hexdigest()
    db_token = db.query(RefreshToken).filter(RefreshToken.token == hashed_token).first()
    if db_token:
        db.delete(db_token)
        db.commit()
    return {"status": "success"}

@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: User = Depends(deps.get_current_active_user)):
    return current_user

@router.delete("/me")
def delete_user_me(
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(get_db)
):
    db.delete(current_user)
    db.commit()
    return {"status": "success", "detail": "User deleted successfully"}

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return {"status": "success", "detail": f"User {user_id} deleted successfully"}
