import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from config import settings
from app.data.database import get_db
from app.data.repositories.user import user_repo
from app.data.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

def get_current_user(
    db: Session = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except (jwt.PyJWTError, ValueError):
        raise credentials_exception
    
    user = user_repo.get(db, id=user_id)
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Inactive user account"
        )
        
    return user

def require_owner(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation restricted to business owners only"
        )
    return current_user

def require_staff(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "staff":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation restricted to shop staff only"
        )
    return current_user

def require_owner_or_staff(current_user: User = Depends(get_current_user)) -> User:
    """Allow access if user is owner OR staff."""
    if current_user.role not in ["owner", "staff"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation restricted to owners or staff members"
        )
    return current_user