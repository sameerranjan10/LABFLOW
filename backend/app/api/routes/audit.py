from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_roles
from app.utils.enums import UserRole
from app.models.audit import AuditLog
from app.schemas.common import SuccessResponse, PaginatedResponse, PaginationMeta

router = APIRouter(prefix="/audit", tags=["Audit Trail"])


@router.get("", response_model=PaginatedResponse[dict])
def list_audit_logs(
    entity_type: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER]))
):
    """Retrieve system audit logs for administrative inspection"""
    query = db.query(AuditLog)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if action:
        query = query.filter(AuditLog.action == action)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)

    total = query.count()
    offset = (page - 1) * limit
    logs = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()
    pages = (total + limit - 1) // limit if total > 0 else 1

    formatted_logs = [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "old_value": log.old_value,
            "new_value": log.new_value,
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat()
        }
        for log in logs
    ]

    return PaginatedResponse(
        data=formatted_logs,
        pagination=PaginationMeta(page=page, limit=limit, total=total, pages=pages)
    )
