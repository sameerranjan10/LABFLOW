from datetime import datetime, timezone
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.sample import Sample
from app.models.order import Order
from app.schemas.sample import SampleStatus
from app.utils.enums import OrderStatus
from app.services.audit_service import log_audit_event
from app.services.notification_service import create_notification


def get_sample_by_id(db: Session, sample_id: str) -> Sample:
    sample = db.query(Sample).filter(
        or_(Sample.id == sample_id, Sample.sample_uid == sample_id)
    ).first()

    if not sample:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample with ID/UID '{sample_id}' not found"
        )
    return sample


def collect_sample(db: Session, sample_id: str, performer_id: str) -> Sample:
    sample = get_sample_by_id(db, sample_id)

    if sample.collection_status != SampleStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot collect sample with status '{sample.collection_status.value}'. Expected PENDING."
        )

    now = datetime.now(timezone.utc)
    sample.collection_status = SampleStatus.COLLECTED
    sample.collected_by = performer_id
    sample.collected_at = now

    # Check if all samples for this order are collected
    order = db.query(Order).filter(Order.id == sample.order_id).first()
    if order and order.status == OrderStatus.SAMPLE_PENDING:
        order.status = OrderStatus.SAMPLE_COLLECTED

    db.commit()
    db.refresh(sample)

    log_audit_event(
        db,
        action="SAMPLE_COLLECTED",
        entity_type="Sample",
        entity_id=sample.id,
        user_id=performer_id,
        new_value={"sample_uid": sample.sample_uid, "collected_at": now.isoformat()}
    )

    return sample


def receive_sample(db: Session, sample_id: str, performer_id: str) -> Sample:
    sample = get_sample_by_id(db, sample_id)

    if sample.collection_status != SampleStatus.COLLECTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot receive sample with status '{sample.collection_status.value}'. Expected COLLECTED."
        )

    now = datetime.now(timezone.utc)
    sample.collection_status = SampleStatus.RECEIVED
    sample.received_at = now

    db.commit()
    db.refresh(sample)

    log_audit_event(
        db,
        action="SAMPLE_RECEIVED",
        entity_type="Sample",
        entity_id=sample.id,
        user_id=performer_id
    )

    return sample


def reject_sample(db: Session, sample_id: str, reason: str, performer_id: str) -> Sample:
    sample = get_sample_by_id(db, sample_id)

    if sample.collection_status in [SampleStatus.REJECTED, SampleStatus.COMPLETED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject sample with status '{sample.collection_status.value}'"
        )

    now = datetime.now(timezone.utc)
    sample.collection_status = SampleStatus.REJECTED
    sample.rejected_at = now
    sample.rejection_reason = reason

    db.commit()
    db.refresh(sample)

    log_audit_event(
        db,
        action="SAMPLE_REJECTED",
        entity_type="Sample",
        entity_id=sample.id,
        user_id=performer_id,
        new_value={"reason": reason}
    )

    create_notification(
        db,
        title="Sample Rejected",
        message=f"Sample {sample.sample_uid} rejected: {reason}",
        type="SAMPLE_REJECTED",
        reference_entity_type="Sample",
        reference_entity_id=sample.id
    )

    return sample


def start_processing_sample(db: Session, sample_id: str, performer_id: str) -> Sample:
    sample = get_sample_by_id(db, sample_id)

    if sample.collection_status != SampleStatus.RECEIVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot start processing sample with status '{sample.collection_status.value}'. Expected RECEIVED."
        )

    sample.collection_status = SampleStatus.PROCESSING

    order = db.query(Order).filter(Order.id == sample.order_id).first()
    if order:
        order.status = OrderStatus.PROCESSING

    db.commit()
    db.refresh(sample)

    log_audit_event(
        db,
        action="SAMPLE_PROCESSING_STARTED",
        entity_type="Sample",
        entity_id=sample.id,
        user_id=performer_id
    )

    return sample


def complete_sample(db: Session, sample_id: str, performer_id: str) -> Sample:
    sample = get_sample_by_id(db, sample_id)

    if sample.collection_status != SampleStatus.PROCESSING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot complete sample with status '{sample.collection_status.value}'. Expected PROCESSING."
        )

    sample.collection_status = SampleStatus.COMPLETED

    db.commit()
    db.refresh(sample)

    log_audit_event(
        db,
        action="SAMPLE_COMPLETED",
        entity_type="Sample",
        entity_id=sample.id,
        user_id=performer_id
    )

    return sample
