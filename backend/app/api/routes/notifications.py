from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.notification import NotificationRead
from app.schemas.common import SuccessResponse
from app.services.notification_service import (
    get_user_notifications, mark_notification_read, mark_all_notifications_read
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=SuccessResponse[List[NotificationRead]])
def list_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get system notifications for current logged in user"""
    notifs = get_user_notifications(db, current_user.id, unread_only=unread_only)
    return SuccessResponse(data=[NotificationRead.model_validate(n) for n in notifs])


@router.post("/{notification_id}/read", response_model=SuccessResponse[dict])
def mark_read_endpoint(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a specific notification as read"""
    success = mark_notification_read(db, notification_id, current_user.id)
    return SuccessResponse(data={"updated": success}, message="Notification marked as read")


@router.post("/read-all", response_model=SuccessResponse[dict])
def mark_all_read_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read"""
    count = mark_all_notifications_read(db, current_user.id)
    return SuccessResponse(data={"marked_read_count": count}, message=f"Marked {count} notifications as read")
