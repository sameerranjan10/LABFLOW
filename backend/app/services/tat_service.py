from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.order import Order
from app.schemas.order import OrderTATRead
from app.utils.enums import OrderStatus


def calculate_order_tat(order: Order) -> OrderTATRead:
    ordered_at = order.ordered_at
    expected_completion = order.expected_completion_at
    completed_at = order.completed_at
    now = datetime.now(timezone.utc)

    # Total expected minutes based on tests or stored expected_completion_at
    expected_tat_minutes = 120
    if expected_completion and ordered_at:
        expected_tat_minutes = int((expected_completion - ordered_at).total_seconds() / 60)

    actual_tat_minutes: Optional[int] = None
    if completed_at and ordered_at:
        actual_tat_minutes = int((completed_at - ordered_at).total_seconds() / 60)

    # Dynamic overdue check
    is_overdue = False
    if order.status not in [OrderStatus.COMPLETED, OrderStatus.CANCELLED]:
        if expected_completion and now > expected_completion:
            is_overdue = True
    else:
        if completed_at and expected_completion and completed_at > expected_completion:
            is_overdue = True

    return OrderTATRead(
        order_id=order.id,
        order_uid=order.order_uid,
        ordered_at=ordered_at,
        expected_completion_at=expected_completion,
        completed_at=completed_at,
        expected_tat_minutes=expected_tat_minutes,
        actual_tat_minutes=actual_tat_minutes,
        is_overdue=is_overdue,
        status=order.status
    )
