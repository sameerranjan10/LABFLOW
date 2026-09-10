from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.core.security import verify_password, get_password_hash, create_access_token
from app.services.audit_service import log_audit_event


def register_user(db: Session, req: RegisterRequest, performer_id: Optional[str] = None) -> User:
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with email '{req.email}' already exists"
        )

    hashed_pw = get_password_hash(req.password)
    user = User(
        name=req.name,
        email=req.email,
        phone=req.phone,
        password_hash=hashed_pw,
        role=req.role,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_audit_event(
        db,
        action="USER_CREATED",
        entity_type="User",
        entity_id=user.id,
        user_id=performer_id or user.id,
        new_value={"name": user.name, "email": user.email, "role": user.role.value}
    )

    return user


def authenticate_user(db: Session, req: LoginRequest) -> TokenResponse:
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    token = create_access_token(subject=user.id, role=user.role.value)
    return TokenResponse(access_token=token, user=user)
