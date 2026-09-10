from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.result import Result
from app.models.order import OrderTest, Order
from app.models.test import Test
from app.schemas.result import ResultCreate, ResultUpdate
from app.utils.enums import ResultStatus, ResultFlag, OrderTestStatus, OrderStatus
from app.utils.helpers import evaluate_numeric_flag
from app.services.audit_service import log_audit_event
from app.services.notification_service import create_notification


def enter_result(db: Session, data: ResultCreate, performer_id: str) -> Result:
    # Validate OrderTest
    order_test = db.query(OrderTest).filter(OrderTest.id == data.order_test_id).first()
    if not order_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"OrderTest with ID '{data.order_test_id}' not found"
        )

    # Check if result already exists
    existing_result = db.query(Result).filter(Result.order_test_id == data.order_test_id).first()
    if existing_result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Result already exists for this test. Use update endpoint instead."
        )

    # Get test reference range & unit if not provided
    test = db.query(Test).filter(Test.id == order_test.test_id).first()
    ref_range = data.reference_range or (test.normal_range if test else None)
    unit = data.unit or (test.unit if test else None)

    # Calculate numeric flag
    flag = ResultFlag.NORMAL
    if data.numeric_value is not None:
        flag = evaluate_numeric_flag(data.numeric_value, ref_range)
    elif data.value.replace('.', '', 1).isdigit():
        num_val = float(data.value)
        data.numeric_value = num_val
        flag = evaluate_numeric_flag(num_val, ref_range)

    now = datetime.now(timezone.utc)
    result = Result(
        order_test_id=data.order_test_id,
        value=data.value,
        numeric_value=data.numeric_value,
        unit=unit,
        reference_range=ref_range,
        flag=flag,
        entered_by=performer_id,
        entered_at=now,
        status=ResultStatus.ENTERED,
        comments=data.comments
    )
    db.add(result)

    order_test.status = OrderTestStatus.ENTERED
    order_test.completed_at = now

    # Update parent order status
    order = db.query(Order).filter(Order.id == order_test.order_id).first()
    if order:
        order.status = OrderStatus.VERIFICATION_PENDING

    db.commit()
    db.refresh(result)

    log_audit_event(
        db,
        action="RESULT_ENTERED",
        entity_type="Result",
        entity_id=result.id,
        user_id=performer_id,
        new_value={"value": result.value, "flag": result.flag.value}
    )

    if result.flag == ResultFlag.CRITICAL:
        create_notification(
            db,
            title="CRITICAL RESULT DETECTED",
            message=f"Critical result '{result.value}' entered for test '{test.name if test else ''}'",
            type="CRITICAL_RESULT",
            reference_entity_type="Result",
            reference_entity_id=result.id
        )

    return result


def verify_result(db: Session, result_id: str, performer_id: str) -> Result:
    result = db.query(Result).filter(Result.id == result_id).first()
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Result with ID '{result_id}' not found"
        )

    if result.status == ResultStatus.VERIFIED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Result is already verified"
        )

    now = datetime.now(timezone.utc)
    result.status = ResultStatus.VERIFIED
    result.verified_by = performer_id
    result.verified_at = now

    order_test = db.query(OrderTest).filter(OrderTest.id == result.order_test_id).first()
    if order_test:
        order_test.status = OrderTestStatus.VERIFIED

    db.commit()
    db.refresh(result)

    log_audit_event(
        db,
        action="RESULT_VERIFIED",
        entity_type="Result",
        entity_id=result.id,
        user_id=performer_id
    )

    return result


def update_result(db: Session, result_id: str, data: ResultUpdate, performer_id: str) -> Result:
    result = db.query(Result).filter(Result.id == result_id).first()
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Result with ID '{result_id}' not found"
        )

    was_verified = (result.status == ResultStatus.VERIFIED)
    old_value = {
        "value": result.value,
        "numeric_value": result.numeric_value,
        "flag": result.flag.value,
        "status": result.status.value
    }

    update_dict = data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(result, field, val)

    # Recalculate flag if value changed
    if "value" in update_dict or "numeric_value" in update_dict:
        if result.numeric_value is not None:
            result.flag = evaluate_numeric_flag(result.numeric_value, result.reference_range)

    # If verified result is modified, reset status to ENTERED for re-verification and audit log
    if was_verified:
        result.status = ResultStatus.ENTERED
        result.verified_by = None
        result.verified_at = None

    db.commit()
    db.refresh(result)

    action_name = "VERIFIED_RESULT_MODIFIED" if was_verified else "RESULT_UPDATED"
    log_audit_event(
        db,
        action=action_name,
        entity_type="Result",
        entity_id=result.id,
        user_id=performer_id,
        old_value=old_value,
        new_value=update_dict
    )

    return result
