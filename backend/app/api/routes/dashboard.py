from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.dashboard import (
    DashboardSummary,
    DashboardStatusCount,
    DashboardPriorityCount,
    DashboardTopTest,
    DashboardTATSummary,
    DashboardActivityItem,
    DashboardTrendItem
)
from app.schemas.common import SuccessResponse
from app.services.dashboard_service import (
    get_dashboard_summary,
    get_order_status_counts,
    get_priority_counts,
    get_top_tests,
    get_dashboard_tat,
    get_dashboard_activity,
    get_dashboard_trends
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard Analytics"])


@router.get("/summary", response_model=SuccessResponse[DashboardSummary])
def get_summary(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get high-level laboratory KPI metrics (orders, patients, pending, processing, completed, urgent, overdue)"""
    summary = get_dashboard_summary(db)
    return SuccessResponse(data=summary)


@router.get("/order-status", response_model=SuccessResponse[List[DashboardStatusCount]])
def get_status_distribution(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get order count breakdown grouped by workflow status"""
    counts = get_order_status_counts(db)
    return SuccessResponse(data=counts)


@router.get("/priority", response_model=SuccessResponse[List[DashboardPriorityCount]])
def get_priority_distribution(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get order count breakdown grouped by priority level"""
    counts = get_priority_counts(db)
    return SuccessResponse(data=counts)


@router.get("/tests", response_model=SuccessResponse[List[DashboardTopTest]])
def get_most_requested_tests(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get most frequently ordered laboratory tests"""
    top_tests = get_top_tests(db, limit=limit)
    return SuccessResponse(data=top_tests)


@router.get("/tat", response_model=SuccessResponse[DashboardTATSummary])
def get_tat_analytics(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get Turnaround Time (TAT) performance metrics: average, median, on-time completion, overdue percentage"""
    tat_summary = get_dashboard_tat(db)
    return SuccessResponse(data=tat_summary)


@router.get("/activity", response_model=SuccessResponse[List[DashboardActivityItem]])
def get_recent_activity(limit: int = Query(15, ge=1, le=100), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get recent operational activity stream and audit events"""
    activities = get_dashboard_activity(db, limit=limit)
    return SuccessResponse(data=activities)


@router.get("/trends", response_model=SuccessResponse[List[DashboardTrendItem]])
def get_order_trends(days: int = Query(7, ge=1, le=30), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get daily order creation and completion trends"""
    trends = get_dashboard_trends(db, days=days)
    return SuccessResponse(data=trends)
