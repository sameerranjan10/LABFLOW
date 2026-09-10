from typing import List
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_roles
from app.utils.enums import UserRole
from app.models.user import User
from app.models.result import Result
from app.models.order import Order
from app.schemas.result import ResultRead, ResultCreate, ResultUpdate
from app.schemas.common import SuccessResponse
from app.services.result_service import enter_result, verify_result, update_result
from app.services.order_service import get_order_by_id

router = APIRouter(prefix="", tags=["Result Management"])


@router.post("/results", response_model=SuccessResponse[ResultRead], status_code=status.HTTP_201_CREATED)
def enter_result_endpoint(
    req: ResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.LAB_TECHNICIAN]))
):
    """Enter a test result (Technician / Manager / Admin)"""
    result = enter_result(db, req, performer_id=current_user.id)
    return SuccessResponse(data=ResultRead.model_validate(result), message="Test result entered successfully")


@router.get("/results/{result_id}", response_model=SuccessResponse[ResultRead])
def get_result(result_id: str, db: Session = Depends(get_db)):
    """Get test result by result ID"""
    result = db.query(Result).filter(Result.id == result_id).first()
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Result not found")
    return SuccessResponse(data=ResultRead.model_validate(result))


@router.put("/results/{result_id}", response_model=SuccessResponse[ResultRead])
def update_result_endpoint(
    result_id: str,
    req: ResultUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.PATHOLOGIST, UserRole.LAB_TECHNICIAN]))
):
    """Update test result value or comments. If result was verified, resets verification and logs audit event."""
    result = update_result(db, result_id, req, performer_id=current_user.id)
    return SuccessResponse(data=ResultRead.model_validate(result), message="Result updated successfully")


@router.post("/results/{result_id}/verify", response_model=SuccessResponse[ResultRead])
def verify_result_endpoint(
    result_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.PATHOLOGIST]))
):
    """Verify test result (Pathologist, Manager, Admin only)"""
    result = verify_result(db, result_id, performer_id=current_user.id)
    return SuccessResponse(data=ResultRead.model_validate(result), message="Result verified successfully")


@router.post("/results/{result_id}/reject", response_model=SuccessResponse[ResultRead])
def reject_result_endpoint(
    result_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.PATHOLOGIST]))
):
    """Reject test result for re-testing"""
    result = db.query(Result).filter(Result.id == result_id).first()
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Result not found")
    from app.utils.enums import ResultStatus
    result.status = ResultStatus.REJECTED
    db.commit()
    db.refresh(result)
    return SuccessResponse(data=ResultRead.model_validate(result), message="Result rejected for re-testing")


@router.get("/orders/{order_id}/results", response_model=SuccessResponse[List[ResultRead]])
def get_order_results(order_id: str, db: Session = Depends(get_db)):
    """Get all test results associated with an order"""
    order = get_order_by_id(db, order_id)
    results: List[Result] = []
    for ot in order.order_tests:
        if ot.result:
            results.append(ot.result)
    return SuccessResponse(data=[ResultRead.model_validate(r) for r in results])
