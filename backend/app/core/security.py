from datetime import datetime, timedelta, timezone
from typing import Any, Union
import jwt
from app.core.config import settings
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import bcrypt

ph = PasswordHasher()

# Dummy hash used to mitigate timing attacks for non-existent users
DUMMY_PASSWORD_HASH = "$argon2id$v=19$m=65536,t=3,p=4$XiulVMpZq3XuXWvtHYOwVg$fPs0CTvjk7PLEt3DY3p+a9a1tOmUqDdfE/LGiyarxWI"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # Passlib has a known bug with bcrypt >= 4.0.0. 
        # Bypass passlib for legacy bcrypt hashes.
        if hashed_password.startswith("$2a$") or hashed_password.startswith("$2b$"):
            return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
        return ph.verify(hashed_password, plain_password)
    except VerifyMismatchError:
        return False
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return ph.hash(password)

def needs_password_update(hashed_password: str) -> bool:
    if hashed_password.startswith("$2a$") or hashed_password.startswith("$2b$"):
        return True
    try:
        return ph.check_needs_rehash(hashed_password)
    except Exception:
        return False

def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
