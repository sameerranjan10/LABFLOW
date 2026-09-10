from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.notification import Notification


def create_notification(
    db: Session,
    title: str,
    message: str,
    type: str = "INFO",
    user_id: Optional[str] = None,
    reference_entity_type: Optional[str] = None,
    reference_entity_id: Optional[str] = None
) -> Notification:
    notif = Notification(
        title=title,
        message=message,
        type=type,
        user_id=user_id,
        reference_entity_type=reference_entity_type,
        reference_entity_id=reference_entity_id,
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def get_user_notifications(
    db: Session,
    user_id: str,
    unread_only: bool = False,
    limit: int = 50
) -> List[Notification]:
    query = db.query(Notification).filter(
        (Notification.user_id == user_id) | (Notification.user_id.is_(None))
    )
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).limit(limit).all()


def mark_notification_read(db: Session, notification_id: str, user_id: str) -> bool:
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if notif and (notif.user_id is None or notif.user_id == user_id):
        notif.is_read = True
        db.commit()
        return True
    return False


def mark_all_notifications_read(db: Session, user_id: str) -> int:
    notifs = db.query(Notification).filter(
        (Notification.user_id == user_id) | (Notification.user_id.is_(None)),
        Notification.is_read == False
    ).all()
    count = len(notifs)
    for n in notifs:
        n.is_read = True
    db.commit()
    return count
