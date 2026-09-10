from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import distinct
from app.core.database import get_db
from app.core.dependencies import require_roles
from app.utils.enums import UserRole
from app.models.user import User
from app.models.test import Test
from app.schemas.test import TestRead, TestCreate, TestUpdate
from app.schemas.common import SuccessResponse, PaginatedResponse, PaginationMeta
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/tests", tags=["Test Catalog"])


@router.get("", response_model=PaginatedResponse[TestRead])
def list_tests(
    category: Optional[str] = Query(None),
    sample_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Get laboratory test catalog with optional filters"""
    query = db.query(Test)

    if category:
        query = query.filter(Test.category == category)

    if sample_type:
        query = query.filter(Test.sample_type == sample_type)

    if is_active is not None:
        query = query.filter(Test.is_active == is_active)

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (Test.test_code.ilike(pattern)) | (Test.name.ilike(pattern)) | (Test.category.ilike(pattern))
        )

    total = query.count()
    offset = (page - 1) * limit
    tests = query.order_by(Test.name.asc()).offset(offset).limit(limit).all()
    pages = (total + limit - 1) // limit if total > 0 else 1

    return PaginatedResponse(
        data=[TestRead.model_validate(t) for t in tests],
        pagination=PaginationMeta(page=page, limit=limit, total=total, pages=pages)
    )


@router.get("/categories", response_model=SuccessResponse[List[str]])
def get_categories(db: Session = Depends(get_db)):
    """Get distinct test categories"""
    categories = [row[0] for row in db.query(distinct(Test.category)).all() if row[0]]
    return SuccessResponse(data=categories)


@router.get("/{test_id}", response_model=SuccessResponse[TestRead])
def get_test(test_id: str, db: Session = Depends(get_db)):
    """Get test details by ID or code"""
    test = db.query(Test).filter(
        (Test.id == test_id) | (Test.test_code == test_id)
    ).first()

    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")

    return SuccessResponse(data=TestRead.model_validate(test))


@router.post("", response_model=SuccessResponse[TestRead], status_code=status.HTTP_201_CREATED)
def create_test(
    req: TestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER]))
):
    """Add a new test to the catalog (Admin & Lab Manager only)"""
    existing = db.query(Test).filter(Test.test_code == req.test_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Test with code '{req.test_code}' already exists"
        )

    test = Test(**req.model_dump())
    db.add(test)
    db.commit()
    db.refresh(test)

    log_audit_event(
        db, action="TEST_CREATED", entity_type="Test", entity_id=test.id,
        user_id=current_user.id, new_value={"test_code": test.test_code, "name": test.name}
    )

    return SuccessResponse(data=TestRead.model_validate(test), message="Test added to catalog")


@router.put("/{test_id}", response_model=SuccessResponse[TestRead])
def update_test(
    test_id: str,
    req: TestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER]))
):
    """Update test configuration (Admin & Lab Manager only)"""
    test = db.query(Test).filter(
        (Test.id == test_id) | (Test.test_code == test_id)
    ).first()

    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")

    update_dict = req.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(test, k, v)

    db.commit()
    db.refresh(test)

    log_audit_event(
        db, action="TEST_UPDATED", entity_type="Test", entity_id=test.id,
        user_id=current_user.id, new_value=update_dict
    )

    return SuccessResponse(data=TestRead.model_validate(test), message="Test updated successfully")


@router.delete("/{test_id}", response_model=SuccessResponse[dict])
def delete_test(
    test_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER]))
):
    """Deactivate or remove test from catalog"""
    test = db.query(Test).filter(
        (Test.id == test_id) | (Test.test_code == test_id)
    ).first()

    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")

    test.is_active = False
    db.commit()

    log_audit_event(
        db, action="TEST_DEACTIVATED", entity_type="Test", entity_id=test.id,
        user_id=current_user.id
    )

    return SuccessResponse(data={"deactivated": True}, message="Test deactivated in catalog")
