from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.report import Report
from app.models.order import Order, OrderTest
from app.models.result import Result
from app.models.patient import Patient
from app.models.user import User
from app.schemas.report import ComprehensiveReportDetail, ReportTestResultItem, PatientRead, SampleRead
from app.utils.enums import ReportStatus, ResultStatus, OrderStatus
from app.utils.ids import generate_report_uid
from app.services.audit_service import log_audit_event
from app.services.notification_service import create_notification


def generate_report(db: Session, order_id: str, performer_id: str) -> Report:
    order = db.query(Order).filter(
        or_(Order.id == order_id, Order.order_uid == order_id)
    ).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID/UID '{order_id}' not found"
        )

    # Check if report already exists for this order
    existing_report = db.query(Report).filter(Report.order_id == order.id).first()
    if existing_report:
        return existing_report

    report_uid = generate_report_uid()
    while db.query(Report).filter(Report.report_uid == report_uid).first():
        report_uid = generate_report_uid()

    now = datetime.now(timezone.utc)
    report = Report(
        report_uid=report_uid,
        order_id=order.id,
        generated_by=performer_id,
        generated_at=now,
        status=ReportStatus.GENERATED
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    log_audit_event(
        db,
        action="REPORT_GENERATED",
        entity_type="Report",
        entity_id=report.id,
        user_id=performer_id,
        new_value={"report_uid": report.report_uid, "order_id": order.id}
    )

    return report


def verify_report(db: Session, report_id: str, performer_id: str) -> Report:
    report = db.query(Report).filter(
        or_(Report.id == report_id, Report.report_uid == report_id)
    ).first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID/UID '{report_id}' not found"
        )

    report.status = ReportStatus.VERIFIED
    report.verified_by = performer_id

    db.commit()
    db.refresh(report)

    log_audit_event(
        db,
        action="REPORT_VERIFIED",
        entity_type="Report",
        entity_id=report.id,
        user_id=performer_id
    )

    return report


def publish_report(db: Session, report_id: str, performer_id: str) -> Report:
    report = db.query(Report).filter(
        or_(Report.id == report_id, Report.report_uid == report_id)
    ).first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID/UID '{report_id}' not found"
        )

    order = db.query(Order).filter(Order.id == report.order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated order not found"
        )

    # Business Rule: Do not allow publishing before required test results are verified
    for ot in order.order_tests:
        if not ot.result or ot.result.status != ResultStatus.VERIFIED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot publish report. Test '{ot.test.name}' result is not verified."
            )

    now = datetime.now(timezone.utc)
    report.status = ReportStatus.PUBLISHED
    report.published_at = now
    report.report_url = f"/api/v1/reports/{report.id}/download"

    # Complete the Order
    order.status = OrderStatus.COMPLETED
    order.completed_at = now

    db.commit()
    db.refresh(report)

    log_audit_event(
        db,
        action="REPORT_PUBLISHED",
        entity_type="Report",
        entity_id=report.id,
        user_id=performer_id
    )

    create_notification(
        db,
        title="Report Published",
        message=f"Lab report {report.report_uid} for order {order.order_uid} has been published.",
        type="REPORT_PUBLISHED",
        reference_entity_type="Report",
        reference_entity_id=report.id
    )

    return report


def get_comprehensive_report_detail(db: Session, report_id: str) -> ComprehensiveReportDetail:
    report = db.query(Report).filter(
        or_(Report.id == report_id, Report.report_uid == report_id)
    ).first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report '{report_id}' not found"
        )

    order = db.query(Order).filter(Order.id == report.order_id).first()
    patient = db.query(Patient).filter(Patient.id == order.patient_id).first()
    verifier = db.query(User).filter(User.id == report.verified_by).first() if report.verified_by else None

    result_items: List[ReportTestResultItem] = []
    for ot in order.order_tests:
        if ot.result:
            result_items.append(ReportTestResultItem(
                test_code=ot.test.test_code,
                test_name=ot.test.name,
                category=ot.test.category,
                value=ot.result.value,
                unit=ot.result.unit,
                reference_range=ot.result.reference_range,
                flag=ot.result.flag,
                comments=ot.result.comments
            ))

    samples_read = [SampleRead.model_validate(s) for s in order.samples]

    return ComprehensiveReportDetail(
        report_uid=report.report_uid,
        laboratory_name="LabFlow Clinical Diagnostics",
        status=report.status,
        generated_at=report.generated_at,
        published_at=report.published_at,
        verifier_name=verifier.name if verifier else None,
        patient=PatientRead.model_validate(patient),
        order_uid=order.order_uid,
        ordered_at=order.ordered_at,
        priority=order.priority.value,
        samples=samples_read,
        results=result_items
    )
