from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.patient import Patient
from app.models.order import Order
from app.models.sample import Sample
from app.models.report import Report
from app.models.test import Test
from app.schemas.search import GlobalSearchResult
from app.schemas.patient import PatientRead
from app.schemas.order import OrderRead
from app.schemas.sample import SampleRead
from app.schemas.report import ReportRead
from app.schemas.test import TestRead
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/search", tags=["Global Search"])


@router.get("", response_model=SuccessResponse[GlobalSearchResult])
def global_search(
    q: str = Query(..., min_length=1, description="Search query string"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Search across patients, orders, samples, reports, and tests"""
    pattern = f"%{q}%"

    # Search Patients
    patients = db.query(Patient).filter(
        or_(
            Patient.patient_uid.ilike(pattern),
            Patient.name.ilike(pattern),
            Patient.phone.ilike(pattern),
            Patient.email.ilike(pattern)
        )
    ).limit(10).all()

    # Search Orders
    orders = db.query(Order).filter(
        or_(
            Order.order_uid.ilike(pattern),
            Order.requested_by.ilike(pattern)
        )
    ).limit(10).all()

    # Search Samples
    samples = db.query(Sample).filter(
        or_(
            Sample.sample_uid.ilike(pattern),
            Sample.sample_type.ilike(pattern)
        )
    ).limit(10).all()

    # Search Reports
    reports = db.query(Report).filter(
        Report.report_uid.ilike(pattern)
    ).limit(10).all()

    # Search Tests
    tests = db.query(Test).filter(
        or_(
            Test.test_code.ilike(pattern),
            Test.name.ilike(pattern),
            Test.category.ilike(pattern)
        )
    ).limit(10).all()

    result = GlobalSearchResult(
        patients=[PatientRead.model_validate(p) for p in patients],
        orders=[OrderRead.model_validate(o) for o in orders],
        samples=[SampleRead.model_validate(s) for s in samples],
        reports=[ReportRead.model_validate(r) for r in reports],
        tests=[TestRead.model_validate(t) for t in tests]
    )

    return SuccessResponse(data=result)
