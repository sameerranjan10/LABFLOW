from datetime import datetime, timedelta, timezone
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from fastapi import HTTPException, status
from app.models.patient import Patient
from app.models.test import Test
from app.models.order import Order, OrderTest
from app.models.sample import Sample
from app.schemas.order import OrderCreate, OrderUpdate, OrderTimelineEvent
from app.utils.enums import OrderPriority, OrderStatus, OrderTestStatus, SampleStatus
from app.utils.ids import generate_order_uid, generate_sample_uid
from app.services.audit_service import log_audit_event
from app.services.notification_service import create_notification


def create_order(db: Session, data: OrderCreate, performer_id: str) -> Order:
    # 1. Validate Patient
    patient = db.query(Patient).filter(
        or_(Patient.id == data.patient_id, Patient.patient_uid == data.patient_id)
    ).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{data.patient_id}' not found"
        )

    # 2. Validate Requested Tests
    if not data.tests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one test"
        )

    db_tests = db.query(Test).filter(
        or_(Test.id.in_(data.tests), Test.test_code.in_(data.tests))
    ).all()

    if len(db_tests) != len(set(data.tests)):
        found_identifiers = {t.id for t in db_tests} | {t.test_code for t in db_tests}
        missing = set(data.tests) - found_identifiers
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tests not found: {', '.join(missing)}"
        )

    # 3. Generate Order UID & calculate completion time
    order_uid = generate_order_uid()
    while db.query(Order).filter(Order.order_uid == order_uid).first():
        order_uid = generate_order_uid()

    now = datetime.now(timezone.utc)
    max_tat = max([t.expected_tat_minutes for t in db_tests] + [120])
    expected_completion = now + timedelta(minutes=max_tat)

    order = Order(
        order_uid=order_uid,
        patient_id=patient.id,
        requested_by=data.requested_by,
        priority=data.priority,
        status=OrderStatus.SAMPLE_PENDING,
        notes=data.notes,
        ordered_at=now,
        expected_completion_at=expected_completion
    )
    db.add(order)
    db.flush()  # Generate order.id

    # 4. Create OrderTest records and Group Samples by sample_type
    sample_types_needed = set()
    for test in db_tests:
        order_test = OrderTest(
            order_id=order.id,
            test_id=test.id,
            status=OrderTestStatus.PENDING
        )
        db.add(order_test)
        sample_types_needed.add(test.sample_type)

    # 5. Automatically create Sample records for required sample types
    for sample_type in sample_types_needed:
        sample_uid = generate_sample_uid()
        sample = Sample(
            sample_uid=sample_uid,
            order_id=order.id,
            sample_type=sample_type,
            collection_status=SampleStatus.PENDING
        )
        db.add(sample)

    db.commit()
    db.refresh(order)

    # 6. Audit & Notification
    log_audit_event(
        db,
        action="ORDER_CREATED",
        entity_type="Order",
        entity_id=order.id,
        user_id=performer_id,
        new_value={"order_uid": order.order_uid, "priority": order.priority.value, "patient_id": patient.id}
    )

    if order.priority in [OrderPriority.URGENT, OrderPriority.STAT]:
        create_notification(
            db,
            title=f"New {order.priority.value} Order",
            message=f"Order {order.order_uid} created for patient {patient.name}",
            type="URGENT_ORDER",
            reference_entity_type="Order",
            reference_entity_id=order.id
        )

    return order


def get_orders(
    db: Session,
    search: Optional[str] = None,
    status_filter: Optional[OrderStatus] = None,
    priority_filter: Optional[OrderPriority] = None,
    patient_id: Optional[str] = None,
    overdue_only: bool = False,
    page: int = 1,
    limit: int = 20
) -> Tuple[List[Order], int]:
    query = db.query(Order)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Order.order_uid.ilike(search_pattern),
                Order.requested_by.ilike(search_pattern)
            )
        )

    if status_filter:
        query = query.filter(Order.status == status_filter)

    if priority_filter:
        query = query.filter(Order.priority == priority_filter)

    if patient_id:
        query = query.filter(Order.patient_id == patient_id)

    if overdue_only:
        now = datetime.now(timezone.utc)
        query = query.filter(
            and_(
                Order.expected_completion_at.isnot(None),
                Order.expected_completion_at < now,
                Order.status.notin_([OrderStatus.COMPLETED, OrderStatus.CANCELLED])
            )
        )

    total = query.count()
    offset = (page - 1) * limit
    orders = query.order_by(Order.ordered_at.desc()).offset(offset).limit(limit).all()

    return orders, total


def get_order_by_id(db: Session, order_id: str) -> Order:
    order = db.query(Order).filter(
        or_(Order.id == order_id, Order.order_uid == order_id)
    ).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID/UID '{order_id}' not found"
        )
    return order


def cancel_order(db: Session, order_id: str, performer_id: str) -> Order:
    order = get_order_by_id(db, order_id)

    if order.status in [OrderStatus.COMPLETED, OrderStatus.CANCELLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel order in status '{order.status.value}'"
        )

    order.status = OrderStatus.CANCELLED
    for ot in order.order_tests:
        ot.status = OrderTestStatus.CANCELLED

    db.commit()
    db.refresh(order)

    log_audit_event(
        db,
        action="ORDER_CANCELLED",
        entity_type="Order",
        entity_id=order.id,
        user_id=performer_id
    )

    return order


def get_order_timeline(db: Session, order_id: str) -> List[OrderTimelineEvent]:
    order = get_order_by_id(db, order_id)
    events: List[OrderTimelineEvent] = []

    # 1. Order Created
    events.append(OrderTimelineEvent(
        event="ORDER_CREATED",
        timestamp=order.ordered_at,
        details=f"Order {order.order_uid} created ({order.priority.value} priority)"
    ))

    # 2. Sample events
    for sample in order.samples:
        if sample.collected_at:
            events.append(OrderTimelineEvent(
                event="SAMPLE_COLLECTED",
                timestamp=sample.collected_at,
                details=f"Sample {sample.sample_uid} ({sample.sample_type}) collected"
            ))
        if sample.received_at:
            events.append(OrderTimelineEvent(
                event="SAMPLE_RECEIVED",
                timestamp=sample.received_at,
                details=f"Sample {sample.sample_uid} received in lab"
            ))
        if sample.rejected_at:
            events.append(OrderTimelineEvent(
                event="SAMPLE_REJECTED",
                timestamp=sample.rejected_at,
                details=f"Sample {sample.sample_uid} rejected: {sample.rejection_reason}"
            ))

    # 3. Result events
    for ot in order.order_tests:
        if ot.result:
            if ot.result.entered_at:
                events.append(OrderTimelineEvent(
                    event="RESULT_ENTERED",
                    timestamp=ot.result.entered_at,
                    details=f"Result entered for test '{ot.test.name}': {ot.result.value}"
                ))
            if ot.result.verified_at:
                events.append(OrderTimelineEvent(
                    event="RESULT_VERIFIED",
                    timestamp=ot.result.verified_at,
                    details=f"Result verified for test '{ot.test.name}'"
                ))

    # 4. Report events
    if order.report:
        if order.report.generated_at:
            events.append(OrderTimelineEvent(
                event="REPORT_GENERATED",
                timestamp=order.report.generated_at,
                details="Lab report generated"
            ))
        if order.report.published_at:
            events.append(OrderTimelineEvent(
                event="REPORT_PUBLISHED",
                timestamp=order.report.published_at,
                details="Lab report published and finalized"
            ))

    # Sort events by timestamp
    events.sort(key=lambda x: x.timestamp)
    return events
