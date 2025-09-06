from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, validator
from services.auth_service import authenticate_user, register_user, create_access_token, verify_token, get_user_profile
import re
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")
security = HTTPBearer()

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    
    @validator('name')
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters')
        return v.strip()
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v

@router.post("/login")
async def login(user: UserLogin):
    try:
        email = user.email.lower().strip()
        logger.info(f"Login attempt for email: {email}")
        
        authenticated_user = authenticate_user(email, user.password)
        
        if not authenticated_user:
            logger.warning(f"Failed login attempt for: {email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid email or password"
            )
        
        access_token = create_access_token(data={"sub": email})
        logger.info(f"Successful login for: {email}")
        
        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": authenticated_user["id"], 
                "email": authenticated_user["email"], 
                "name": authenticated_user["name"]
            }
        }
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error during login: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during login: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Login failed")

@router.post("/register")
async def register(user: UserRegister):
    try:
        email = user.email.lower().strip()
        name = user.name.strip()
        logger.info(f"Registration attempt for email: {email}")
        
        # Register user
        user_id = register_user(email, user.password, name)
        
        if user_id is None:
            logger.warning(f"Registration failed - email already exists: {email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Email already registered"
            )
        
        access_token = create_access_token(data={"sub": email})
        logger.info(f"Successful registration for: {email}")
        
        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "user": {"id": user_id, "email": email, "name": name}
        }
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error during registration: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during registration: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Registration failed")

@router.get("/verify")
async def verify_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        email = verify_token(credentials.credentials)
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid or expired token"
            )
        
        user_profile = get_user_profile(email)
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="User not found"
            )
        
        return {
            "success": True, 
            "user": {
                "id": user_profile["id"],
                "email": user_profile["email"],
                "name": user_profile["name"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Token verification failed"
        )

@router.get("/profile")
async def get_profile(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        email = verify_token(credentials.credentials)
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid or expired token"
            )
        
        user_profile = get_user_profile(email)
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="User not found"
            )
        
        return {
            "success": True,
            "user": {
                "id": user_profile["id"],
                "email": user_profile["email"],
                "name": user_profile["name"],
                "created_at": user_profile["created_at"].isoformat() if user_profile["created_at"] else None
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile fetch error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to fetch profile"
        )

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid or expired token"
        )
    return email