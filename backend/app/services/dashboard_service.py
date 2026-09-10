from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from app.models.order import Order, OrderTest
from app.models.patient import Patient
from app.models.test import Test
from app.models.audit import AuditLog
from app.models.user import User
from app.schemas.dashboard import (
    DashboardSummary,
    DashboardStatusCount,
    DashboardPriorityCount,
    DashboardTopTest,
    DashboardTATSummary,
    DashboardActivityItem,
    DashboardTrendItem
)
from app.utils.enums import OrderStatus, OrderPriority


def get_dashboard_summary(db: Session) -> DashboardSummary:
    now = datetime.now(timezone.utc)

    total_orders = db.query(Order).count()
    total_patients = db.query(Patient).count()

    pending_orders = db.query(Order).filter(
        Order.status.in_([OrderStatus.CREATED, OrderStatus.SAMPLE_PENDING, OrderStatus.SAMPLE_COLLECTED, OrderStatus.RESULT_PENDING])
    ).count()

    processing_orders = db.query(Order).filter(
        Order.status.in_([OrderStatus.PROCESSING, OrderStatus.VERIFICATION_PENDING])
    ).count()

    completed_orders = db.query(Order).filter(Order.status == OrderStatus.COMPLETED).count()

    urgent_orders = db.query(Order).filter(
        Order.priority.in_([OrderPriority.URGENT, OrderPriority.STAT]),
        Order.status != OrderStatus.COMPLETED
    ).count()

    overdue_orders = db.query(Order).filter(
        and_(
            Order.expected_completion_at.isnot(None),
            Order.expected_completion_at < now,
            Order.status.notin_([OrderStatus.COMPLETED, OrderStatus.CANCELLED])
        )
    ).count()

    return DashboardSummary(
        total_orders=total_orders,
        pending_orders=pending_orders,
        processing_orders=processing_orders,
        completed_orders=completed_orders,
        urgent_orders=urgent_orders,
        overdue_orders=overdue_orders,
        total_patients=total_patients
    )


def get_order_status_counts(db: Session) -> List[DashboardStatusCount]:
    results = db.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
    return [DashboardStatusCount(status=status.value, count=count) for status, count in results]


def get_priority_counts(db: Session) -> List[DashboardPriorityCount]:
    results = db.query(Order.priority, func.count(Order.id)).group_by(Order.priority).all()
    return [DashboardPriorityCount(priority=priority.value, count=count) for priority, count in results]


def get_top_tests(db: Session, limit: int = 10) -> List[DashboardTopTest]:
    results = db.query(
        Test.test_code, Test.name, func.count(OrderTest.id).label("count")
    ).join(OrderTest, Test.id == OrderTest.test_id)\
     .group_by(Test.test_code, Test.name)\
     .order_by(func.count(OrderTest.id).desc())\
     .limit(limit).all()

    return [DashboardTopTest(test_code=row[0], name=row[1], count=row[2]) for row in results]


def get_dashboard_tat(db: Session) -> DashboardTATSummary:
    completed_orders = db.query(Order).filter(
        Order.status == OrderStatus.COMPLETED,
        Order.completed_at.isnot(None),
        Order.ordered_at.isnot(None)
    ).all()

    if not completed_orders:
        return DashboardTATSummary(
            average_tat_minutes=0.0,
            median_tat_minutes=0.0,
            completed_within_tat_count=0,
            overdue_count=0,
            overdue_percentage=0.0
        )

    tat_list: List[float] = []
    within_tat_count = 0
    overdue_count = 0

    for order in completed_orders:
        tat = (order.completed_at - order.ordered_at).total_seconds() / 60.0
        tat_list.append(tat)

        if order.expected_completion_at and order.completed_at <= order.expected_completion_at:
            within_tat_count += 1
        else:
            overdue_count += 1

    avg_tat = sum(tat_list) / len(tat_list)
    tat_list.sort()
    n = len(tat_list)
    median_tat = tat_list[n // 2] if n % 2 != 0 else (tat_list[n // 2 - 1] + tat_list[n // 2]) / 2.0
    overdue_pct = (overdue_count / len(completed_orders)) * 100.0

    return DashboardTATSummary(
        average_tat_minutes=round(avg_tat, 1),
        median_tat_minutes=round(median_tat, 1),
        completed_within_tat_count=within_tat_count,
        overdue_count=overdue_count,
        overdue_percentage=round(overdue_pct, 1)
    )


def get_dashboard_activity(db: Session, limit: int = 15) -> List[DashboardActivityItem]:
    logs = db.query(AuditLog, User).outerjoin(User, AuditLog.user_id == User.id)\
        .order_by(AuditLog.created_at.desc()).limit(limit).all()

    items: List[DashboardActivityItem] = []
    for audit, user in logs:
        user_name = user.name if user else "System"
        details = f"{audit.action} on {audit.entity_type} {audit.entity_id}"
        items.append(DashboardActivityItem(
            id=audit.id,
            action=audit.action,
            entity_type=audit.entity_type,
            entity_id=audit.entity_id,
            user_name=user_name,
            timestamp=audit.created_at.isoformat(),
            details=details
        ))
    return items


def get_dashboard_trends(db: Session, days: int = 7) -> List[DashboardTrendItem]:
    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=days)

    orders = db.query(Order).filter(Order.ordered_at >= start_date).all()

    # Group by YYYY-MM-DD
    trend_dict: Dict[str, Dict[str, int]] = {}
    for i in range(days):
        d_str = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
        trend_dict[d_str] = {"order_count": 0, "completed_count": 0}

    for order in orders:
        d_str = order.ordered_at.strftime("%Y-%m-%d")
        if d_str in trend_dict:
            trend_dict[d_str]["order_count"] += 1
            if order.status == OrderStatus.COMPLETED:
                trend_dict[d_str]["completed_count"] += 1

    return [
        DashboardTrendItem(
            date=d_str,
            order_count=counts["order_count"],
            completed_count=counts["completed_count"]
        )
        for d_str, counts in sorted(trend_dict.items())
    ]
