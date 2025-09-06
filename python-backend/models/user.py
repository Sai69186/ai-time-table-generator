from config.database import database
from passlib.context import CryptContext
import logging

logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User:
    @staticmethod
    def create_user(email, password, name):
        try:
            # Validate inputs
            if not email or not password or not name:
                logger.error("Missing required fields for user creation")
                return None
            
            if len(password) < 6:
                logger.error("Password too short")
                return None
            
            if len(name.strip()) < 2:
                logger.error("Name too short")
                return None
            
            # Check if user already exists
            existing_user = User.get_user_by_email(email)
            if existing_user:
                logger.warning(f"User already exists: {email}")
                return None
            
            hashed_password = pwd_context.hash(password)
            query = "INSERT INTO users (email, password, name) VALUES (%s, %s, %s)"
            user_id = database.execute_insert(query, (email.lower(), hashed_password, name.strip()))
            
            if user_id:
                logger.info(f"User created successfully: {email} (ID: {user_id})")
                return user_id
            else:
                logger.error(f"Failed to create user: {email}")
                return None
        except Exception as e:
            logger.error(f"Error creating user {email}: {e}")
            return None
    
    @staticmethod
    def get_user_by_email(email):
        try:
            if not email:
                return None
            
            query = "SELECT * FROM users WHERE email = %s"
            result = database.execute_query(query, (email.lower(),))
            
            if result:
                logger.info(f"User found: {email}")
                return result[0]
            else:
                logger.info(f"User not found: {email}")
                return None
        except Exception as e:
            logger.error(f"Error fetching user {email}: {e}")
            return None
    
    @staticmethod
    def verify_password(plain_password, hashed_password):
        try:
            if not plain_password or not hashed_password:
                return False
            return pwd_context.verify(plain_password, hashed_password)
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False
    
    @staticmethod
    def get_all_users():
        try:
            query = "SELECT id, email, name, created_at FROM users ORDER BY created_at DESC"
            result = database.execute_query(query)
            return result if result else []
        except Exception as e:
            logger.error(f"Error fetching all users: {e}")
            return []