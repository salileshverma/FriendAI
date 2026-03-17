import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.all_models import User
from dotenv import load_dotenv

load_dotenv()

NEXTAUTH_SECRET = os.getenv("NEXTAUTH_SECRET")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        if not NEXTAUTH_SECRET:
            with open('/tmp/backend_debug.log', 'a') as f:
                f.write("DEBUG ERROR: NEXTAUTH_SECRET is not configured on the backend.\n")
            raise Exception("NEXTAUTH_SECRET is not configured on the backend.")
            
        with open('/tmp/backend_debug.log', 'a') as f:
            f.write(f"DEBUG: Decoding token with length {len(token)}\n")
        payload = jwt.decode(token, NEXTAUTH_SECRET, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        name: str = payload.get("name")
        
        if not user_id:
            with open('/tmp/backend_debug.log', 'a') as f:
                f.write("DEBUG ERROR: No sub (user_id) in JWT payload\n")
            raise credentials_exception
            
        with open('/tmp/backend_debug.log', 'a') as f:
            f.write(f"DEBUG: Authenticated user: {email} (ID: {user_id})\n")
            
    except jwt.ExpiredSignatureError:
        with open('/tmp/backend_debug.log', 'a') as f:
            f.write("DEBUG ERROR: JWT token has expired\n")
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError as e:
        with open('/tmp/backend_debug.log', 'a') as f:
            f.write(f"DEBUG ERROR: JWT decode failed: {str(e)}\n")
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        with open('/tmp/backend_debug.log', 'a') as f:
            f.write(f"DEBUG: Auto-creating user record for {email}\n")
        user = User(id=user_id, email=email, name=name)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        with open('/tmp/backend_debug.log', 'a') as f:
            f.write("DEBUG: get_current_user - User found in DB\n")
        
    return user
