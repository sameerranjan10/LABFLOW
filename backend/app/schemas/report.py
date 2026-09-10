from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.utils.enums import ReportStatus, ResultFlag
from app.schemas.patient import PatientRead
from app.schemas.sample import SampleRead


class ReportCreate(BaseModel):
    order_id: str


class ReportRead(BaseModel):
    id: str
    report_uid: str
    order_id: str
    generated_by: Optional[str] = None
    generated_at: Optional[datetime] = None
    verified_by: Optional[str] = None
    published_at: Optional[datetime] = None
    status: ReportStatus
    report_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReportTestResultItem(BaseModel):
    test_code: str
    test_name: str
    category: str
    value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    flag: ResultFlag
    comments: Optional[str] = None


class ComprehensiveReportDetail(BaseModel):
    report_uid: str
    laboratory_name: str = "LabFlow Clinical Diagnostics"
    status: ReportStatus
    generated_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    verifier_name: Optional[str] = None

    patient: PatientRead
    order_uid: str
    ordered_at: datetime
    priority: str
    samples: List[SampleRead] = []
    results: List[ReportTestResultItem] = []
