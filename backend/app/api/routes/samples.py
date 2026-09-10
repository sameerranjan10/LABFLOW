from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_roles, get_current_user
from app.utils.enums import UserRole, SampleStatus
from app.models.user import User
from app.models.sample import Sample
from app.schemas.sample import SampleRead, SampleRejectRequest
from app.schemas.common import SuccessResponse, PaginatedResponse, PaginationMeta
from app.services.sample_service import (
    collect_sample, receive_sample, reject_sample, start_processing_sample, complete_sample, get_sample_by_id
)

router = APIRouter(prefix="/samples", tags=["Sample Management"])


@router.get("", response_model=PaginatedResponse[SampleRead])
def list_samples(
    status: Optional[SampleStatus] = Query(None),
    order_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List laboratory samples with optional status and order filtering"""
    query = db.query(Sample)
    if status:
        query = query.filter(Sample.collection_status == status)
    if order_id:
        query = query.filter(Sample.order_id == order_id)

    total = query.count()
    offset = (page - 1) * limit
    samples = query.order_by(Sample.created_at.desc()).offset(offset).limit(limit).all()
    pages = (total + limit - 1) // limit if total > 0 else 1

    return PaginatedResponse(
        data=[SampleRead.model_validate(s) for s in samples],
        pagination=PaginationMeta(page=page, limit=limit, total=total, pages=pages)
    )


@router.get("/{sample_id}", response_model=SuccessResponse[SampleRead])
def get_sample(sample_id: str, db: Session = Depends(get_db)):
    """Get sample details by ID or sample UID"""
    sample = get_sample_by_id(db, sample_id)
    return SuccessResponse(data=SampleRead.model_validate(sample))


@router.post("/{sample_id}/collect", response_model=SuccessResponse[SampleRead])
def collect_sample_endpoint(
    sample_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.LAB_TECHNICIAN, UserRole.RECEPTIONIST]))
):
    """Mark sample as COLLECTED"""
    sample = collect_sample(db, sample_id, performer_id=current_user.id)
    return SuccessResponse(data=SampleRead.model_validate(sample), message="Sample collected successfully")


@router.post("/{sample_id}/receive", response_model=SuccessResponse[SampleRead])
def receive_sample_endpoint(
    sample_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.LAB_TECHNICIAN]))
):
    """Mark sample as RECEIVED in laboratory"""
    sample = receive_sample(db, sample_id, performer_id=current_user.id)
    return SuccessResponse(data=SampleRead.model_validate(sample), message="Sample received in lab")


@router.post("/{sample_id}/reject", response_model=SuccessResponse[SampleRead])
def reject_sample_endpoint(
    sample_id: str,
    req: SampleRejectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.LAB_TECHNICIAN]))
):
    """Reject sample with a required rejection reason"""
    sample = reject_sample(db, sample_id, reason=req.rejection_reason, performer_id=current_user.id)
    return SuccessResponse(data=SampleRead.model_validate(sample), message="Sample rejected")


@router.post("/{sample_id}/start-processing", response_model=SuccessResponse[SampleRead])
def start_processing_endpoint(
    sample_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.LAB_TECHNICIAN]))
):
    """Start sample processing"""
    sample = start_processing_sample(db, sample_id, performer_id=current_user.id)
    return SuccessResponse(data=SampleRead.model_validate(sample), message="Sample processing started")


@router.post("/{sample_id}/complete", response_model=SuccessResponse[SampleRead])
def complete_sample_endpoint(
    sample_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.LAB_TECHNICIAN]))
):
    """Complete sample analysis"""
    sample = complete_sample(db, sample_id, performer_id=current_user.id)
    return SuccessResponse(data=SampleRead.model_validate(sample), message="Sample analysis completed")
