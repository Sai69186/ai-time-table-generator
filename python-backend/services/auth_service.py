from models.user import User
from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
import os
import logging

logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("JWT_SECRET", "your_jwt_secret_key_here_change_in_production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

def create_access_token(data: dict):
    try:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        logger.info(f"Token created for user: {data.get('sub')}")
        return token
    except Exception as e:
        logger.error(f"Token creation failed: {e}")
        raise

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email:
            logger.info(f"Token verified for user: {email}")
        return email if email else None
    except JWTError as e:
        logger.warning(f"Token verification failed: {e}")
        return None

def authenticate_user(email: str, password: str):
    try:
        user = User.get_user_by_email(email)
        if not user:
            logger.warning(f"User not found: {email}")
            return False
        
        if not User.verify_password(password, user["password"]):
            logger.warning(f"Invalid password for user: {email}")
            return False
        
        logger.info(f"User authenticated successfully: {email}")
        return user
    except Exception as e:
        logger.error(f"Authentication error for {email}: {e}")
        return False

def register_user(email: str, password: str, name: str):
    try:
        logger.info(f"Attempting to register user: {email}")
        
        # Create new user (includes duplicate check)
        user_id = User.create_user(email, password, name)
        if user_id:
            logger.info(f"User registered successfully: {email} (ID: {user_id})")
            return user_id
        else:
            logger.warning(f"User creation failed - likely duplicate email: {email}")
            return None
        
    except Exception as e:
        logger.error(f"Registration error for {email}: {e}")
        return None

def get_user_profile(email: str):
    try:
        user = User.get_user_by_email(email)
        if user:
            logger.info(f"Profile fetched for user: {email}")
            return user
        else:
            logger.warning(f"Profile not found for user: {email}")
            return None
    except Exception as e:
        logger.error(f"Error fetching profile for {email}: {e}")
        return None