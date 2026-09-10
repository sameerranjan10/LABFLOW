from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_roles, get_current_user
from app.utils.enums import UserRole, OrderStatus, OrderPriority
from app.models.user import User
from app.schemas.order import OrderRead, OrderCreate, OrderUpdate, OrderTimelineEvent, OrderTATRead, OrderTestRead
from app.schemas.common import SuccessResponse, PaginatedResponse, PaginationMeta
from app.services.order_service import (
    create_order, get_orders, get_order_by_id, cancel_order, get_order_timeline
)
from app.services.tat_service import calculate_order_tat

router = APIRouter(prefix="/orders", tags=["Order Management"])


@router.post("", response_model=SuccessResponse[OrderRead], status_code=status.HTTP_201_CREATED)
def create_order_endpoint(
    req: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.RECEPTIONIST]))
):
    """Create a new laboratory order with tests and samples"""
    order = create_order(db, req, performer_id=current_user.id)
    return SuccessResponse(data=OrderRead.model_validate(order), message="Order created successfully")


@router.get("", response_model=PaginatedResponse[OrderRead])
def list_orders(
    search: Optional[str] = Query(None, description="Search by Order UID or Doctor"),
    status: Optional[OrderStatus] = Query(None),
    priority: Optional[OrderPriority] = Query(None),
    patient_id: Optional[str] = Query(None),
    overdue: bool = Query(False, description="Filter orders that are overdue"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List orders with rich filtering by status, priority, patient, overdue state, search, and pagination"""
    orders, total = get_orders(
        db, search=search, status_filter=status, priority_filter=priority,
        patient_id=patient_id, overdue_only=overdue, page=page, limit=limit
    )
    pages = (total + limit - 1) // limit if total > 0 else 1

    return PaginatedResponse(
        data=[OrderRead.model_validate(o) for o in orders],
        pagination=PaginationMeta(page=page, limit=limit, total=total, pages=pages)
    )


@router.get("/{order_id}", response_model=SuccessResponse[OrderRead])
def get_order(order_id: str, db: Session = Depends(get_db)):
    """Get order details by internal ID or Order UID"""
    order = get_order_by_id(db, order_id)
    return SuccessResponse(data=OrderRead.model_validate(order))


@router.post("/{order_id}/cancel", response_model=SuccessResponse[OrderRead])
def cancel_order_endpoint(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.RECEPTIONIST]))
):
    """Cancel an active order"""
    order = cancel_order(db, order_id, performer_id=current_user.id)
    return SuccessResponse(data=OrderRead.model_validate(order), message="Order cancelled")


@router.get("/{order_id}/timeline", response_model=SuccessResponse[List[OrderTimelineEvent]])
def get_timeline(order_id: str, db: Session = Depends(get_db)):
    """Get complete chronological timeline of events for an order"""
    timeline = get_order_timeline(db, order_id)
    return SuccessResponse(data=timeline)


@router.get("/{order_id}/tests", response_model=SuccessResponse[List[OrderTestRead]])
def get_order_tests(order_id: str, db: Session = Depends(get_db)):
    """Get list of assigned tests and results for an order"""
    order = get_order_by_id(db, order_id)
    return SuccessResponse(data=[OrderTestRead.model_validate(ot) for ot in order.order_tests])


@router.get("/{order_id}/tat", response_model=SuccessResponse[OrderTATRead])
def get_order_tat(order_id: str, db: Session = Depends(get_db)):
    """Get Turnaround Time (TAT) metrics and overdue status for an order"""
    order = get_order_by_id(db, order_id)
    tat_info = calculate_order_tat(order)
    return SuccessResponse(data=tat_info)
