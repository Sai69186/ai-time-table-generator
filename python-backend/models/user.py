from config.database import database
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User:
    @staticmethod
    def create_user(email, password, name):
        try:
            if not email or not password or not name:
                return None
            
            if len(password) < 6 or len(name.strip()) < 2:
                return None
            
            hashed_password = pwd_context.hash(password)
            query = "INSERT INTO users (email, password, name) VALUES (%s, %s, %s)"
            user_id = database.execute_insert(query, (email.lower(), hashed_password, name.strip()))
            return user_id
        except Exception as e:
            print(f"Error creating user {email}: {e}")
            return None
    
    @staticmethod
    def get_user_by_email(email):
        try:
            if not email:
                return None
            
            query = "SELECT * FROM users WHERE email = %s"
            result = database.execute_query(query, (email.lower(),))
            return result[0] if result else None
        except Exception as e:
            print(f"Error fetching user {email}: {e}")
            return None
    
    @staticmethod
    def verify_password(plain_password, hashed_password):
        try:
            if not plain_password or not hashed_password:
                return False
            return pwd_context.verify(plain_password, hashed_password)
        except Exception as e:
            print(f"Password verification error: {e}")
            return False