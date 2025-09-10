from models.user import User
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os

SECRET_KEY = os.getenv("JWT_SECRET", "your_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    try:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return token
    except Exception as e:
        print(f"Token creation failed: {e}")
        raise

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        return email if email else None
    except JWTError:
        return None

def authenticate_user(email: str, password: str):
    try:
        user = User.get_user_by_email(email)
        if not user:
            return False
        
        if not User.verify_password(password, user["password"]):
            return False
        
        return user
    except Exception as e:
        print(f"Authentication error for {email}: {e}")
        return False

def register_user(email: str, password: str, name: str):
    try:
        existing_user = User.get_user_by_email(email)
        if existing_user:
            return None
        
        user_id = User.create_user(email, password, name)
        return user_id
    except Exception as e:
        print(f"Registration error for {email}: {e}")
        return None