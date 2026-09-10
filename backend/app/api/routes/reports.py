from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_roles
from app.utils.enums import UserRole
from app.models.user import User
from app.schemas.report import ReportRead, ComprehensiveReportDetail
from app.schemas.common import SuccessResponse
from app.services.report_service import (
    generate_report, verify_report, publish_report, get_comprehensive_report_detail
)

router = APIRouter(prefix="/reports", tags=["Report Generation"])


@router.post("/{order_id}/generate", response_model=SuccessResponse[ReportRead], status_code=status.HTTP_201_CREATED)
def generate_report_endpoint(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.PATHOLOGIST, UserRole.LAB_TECHNICIAN]))
):
    """Generate laboratory test report draft for an order"""
    report = generate_report(db, order_id, performer_id=current_user.id)
    return SuccessResponse(data=ReportRead.model_validate(report), message="Report generated successfully")


@router.get("/{report_id}", response_model=SuccessResponse[ComprehensiveReportDetail])
def get_report(report_id: str, db: Session = Depends(get_db)):
    """Get full structured laboratory report details with patient, test results, and verification status"""
    detail = get_comprehensive_report_detail(db, report_id)
    return SuccessResponse(data=detail)


@router.post("/{report_id}/verify", response_model=SuccessResponse[ReportRead])
def verify_report_endpoint(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.PATHOLOGIST]))
):
    """Verify laboratory report (Pathologist, Manager, Admin only)"""
    report = verify_report(db, report_id, performer_id=current_user.id)
    return SuccessResponse(data=ReportRead.model_validate(report), message="Report verified successfully")


@router.post("/{report_id}/publish", response_model=SuccessResponse[ReportRead])
def publish_report_endpoint(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.PATHOLOGIST]))
):
    """Publish laboratory report. Gated: requires all results to be verified first."""
    report = publish_report(db, report_id, performer_id=current_user.id)
    return SuccessResponse(data=ReportRead.model_validate(report), message="Report published successfully. Order completed.")


@router.get("/{report_id}/download")
def download_report_pdf(report_id: str, db: Session = Depends(get_db)):
    """Download laboratory report as PDF or structured document"""
    detail = get_comprehensive_report_detail(db, report_id)

    # Render simple PDF or HTML document stream
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        import io

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        p.setFont("Helvetica-Bold", 18)
        p.drawString(50, 750, f"{detail.laboratory_name}")
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, 725, f"LABORATORY TEST REPORT - {detail.report_uid}")

        p.setFont("Helvetica", 10)
        p.drawString(50, 690, f"Patient: {detail.patient.name} ({detail.patient.gender.value}, {detail.patient.age} yrs)")
        p.drawString(50, 675, f"Patient UID: {detail.patient.patient_uid}")
        p.drawString(50, 660, f"Order UID: {detail.order_uid} | Status: {detail.status.value}")

        p.setFont("Helvetica-Bold", 11)
        p.drawString(50, 620, "TEST RESULTS:")
        p.drawString(50, 605, "Test Name                Result        Unit         Reference Range   Flag")
        p.line(50, 600, 550, 600)

        y = 580
        p.setFont("Helvetica", 10)
        for res in detail.results:
            p.drawString(50, y, f"{res.test_name[:22]:<22} {res.value:<12} {res.unit or '':<10} {res.reference_range or '':<16} {res.flag.value}")
            y -= 20

        if detail.verifier_name:
            p.drawString(50, y - 30, f"Verified By: {detail.verifier_name}")

        p.showPage()
        p.save()
        pdf_data = buffer.getvalue()
        buffer.close()

        return Response(content=pdf_data, media_type="application/pdf", headers={
            "Content-Disposition": f"attachment; filename=LabReport-{detail.report_uid}.pdf"
        })
    except ImportError:
        # Fallback to plain text document if ReportLab is not available
        txt_content = f"LABORATORY TEST REPORT: {detail.report_uid}\n"
        txt_content += f"Laboratory: {detail.laboratory_name}\n"
        txt_content += f"Patient: {detail.patient.name} ({detail.patient.patient_uid})\n"
        txt_content += f"Order UID: {detail.order_uid}\n\nRESULTS:\n"
        for res in detail.results:
            txt_content += f"- {res.test_name}: {res.value} {res.unit or ''} [{res.flag.value}]\n"
        return Response(content=txt_content, media_type="text/plain", headers={
            "Content-Disposition": f"attachment; filename=LabReport-{detail.report_uid}.txt"
        })
