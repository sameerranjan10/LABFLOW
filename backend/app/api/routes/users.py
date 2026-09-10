from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_roles, get_current_user
from app.utils.enums import UserRole
from app.models.user import User
from app.schemas.user import UserRead, UserCreate, UserUpdate, UserRoleUpdate, UserStatusUpdate
from app.schemas.common import SuccessResponse, PaginatedResponse, PaginationMeta
from app.services.auth_service import register_user
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/users", tags=["Staff Management"])


@router.get("", response_model=PaginatedResponse[UserRead])
def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    role: Optional[UserRole] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER]))
):
    """List laboratory staff members (Admin & Lab Manager only)"""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)

    total = query.count()
    offset = (page - 1) * limit
    users = query.order_by(User.created_at.desc()).offset(offset).limit(limit).all()
    pages = (total + limit - 1) // limit if total > 0 else 1

    return PaginatedResponse(
        data=[UserRead.model_validate(u) for u in users],
        pagination=PaginationMeta(page=page, limit=limit, total=total, pages=pages)
    )


@router.get("/{user_id}", response_model=SuccessResponse[UserRead])
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER]))
):
    """Get staff member details by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return SuccessResponse(data=UserRead.model_validate(user))


@router.post("", response_model=SuccessResponse[UserRead], status_code=status.HTTP_201_CREATED)
def create_user(
    req: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER]))
):
    """Create a new staff user (Admin & Lab Manager only)"""
    from app.schemas.auth import RegisterRequest
    reg_req = RegisterRequest(
        name=req.name,
        email=req.email,
        phone=req.phone or "",
        password=req.password,
        role=req.role
    )
    user = register_user(db, reg_req, performer_id=current_user.id)
    return SuccessResponse(data=UserRead.model_validate(user), message="Staff user created successfully")


@router.put("/{user_id}", response_model=SuccessResponse[UserRead])
def update_user(
    user_id: str,
    req: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER]))
):
    """Update staff member profile"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    update_dict = req.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(user, k, v)

    db.commit()
    db.refresh(user)

    log_audit_event(
        db, action="USER_UPDATED", entity_type="User", entity_id=user.id,
        user_id=current_user.id, new_value=update_dict
    )

    return SuccessResponse(data=UserRead.model_validate(user), message="User profile updated")


@router.patch("/{user_id}/status", response_model=SuccessResponse[UserRead])
def patch_user_status(
    user_id: str,
    req: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER]))
):
    """Deactivate or activate staff user account"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = req.is_active
    db.commit()
    db.refresh(user)

    log_audit_event(
        db, action="USER_STATUS_CHANGED", entity_type="User", entity_id=user.id,
        user_id=current_user.id, new_value={"is_active": req.is_active}
    )

    return SuccessResponse(data=UserRead.model_validate(user), message="User status updated")


@router.patch("/{user_id}/role", response_model=SuccessResponse[UserRead])
def patch_user_role(
    user_id: str,
    req: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    """Change staff user role (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.role = req.role
    db.commit()
    db.refresh(user)

    log_audit_event(
        db, action="USER_ROLE_CHANGED", entity_type="User", entity_id=user.id,
        user_id=current_user.id, new_value={"role": req.role.value}
    )

    return SuccessResponse(data=UserRead.model_validate(user), message="User role updated")
