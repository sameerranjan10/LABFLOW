from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.schemas.user import UserRead
from app.schemas.common import SuccessResponse
from app.services.auth_service import register_user, authenticate_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=SuccessResponse[UserRead], status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new laboratory staff member"""
    user = register_user(db, req)
    return SuccessResponse(data=UserRead.model_validate(user), message="User registered successfully")


@router.post("/login", response_model=SuccessResponse[TokenResponse])
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate staff member and issue JWT access token"""
    token_resp = authenticate_user(db, req)
    return SuccessResponse(data=token_resp, message="Login successful")


@router.post("/refresh", response_model=SuccessResponse[TokenResponse])
def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh JWT access token for current active user"""
    from app.core.security import create_access_token
    new_token = create_access_token(subject=current_user.id, role=current_user.role.value)
    token_resp = TokenResponse(access_token=new_token, user=UserRead.model_validate(current_user))
    return SuccessResponse(data=token_resp, message="Token refreshed successfully")


@router.post("/logout", response_model=SuccessResponse[dict])
def logout(current_user: User = Depends(get_current_user)):
    """Logout current user session"""
    return SuccessResponse(data={"logged_out": True}, message="Successfully logged out")


@router.get("/me", response_model=SuccessResponse[UserRead])
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile"""
    return SuccessResponse(data=UserRead.model_validate(current_user), message="User profile retrieved")
