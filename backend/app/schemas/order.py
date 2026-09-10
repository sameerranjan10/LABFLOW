from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.utils.enums import OrderPriority, OrderStatus, OrderTestStatus
from app.schemas.patient import PatientRead
from app.schemas.test import TestRead
from app.schemas.result import ResultRead


class OrderCreate(BaseModel):
    patient_id: str
    tests: List[str]  # Can be test IDs or test codes (e.g. ["CBC", "BLOOD_SUGAR"])
    priority: OrderPriority = OrderPriority.ROUTINE
    requested_by: Optional[str] = None
    notes: Optional[str] = None


class OrderUpdate(BaseModel):
    priority: Optional[OrderPriority] = None
    status: Optional[OrderStatus] = None
    requested_by: Optional[str] = None
    notes: Optional[str] = None


class OrderTestRead(BaseModel):
    id: str
    order_id: str
    test_id: str
    status: OrderTestStatus
    assigned_to: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    test: Optional[TestRead] = None
    result: Optional[ResultRead] = None

    model_config = ConfigDict(from_attributes=True)


class OrderRead(BaseModel):
    id: str
    order_uid: str
    patient_id: str
    requested_by: Optional[str] = None
    priority: OrderPriority
    status: OrderStatus
    notes: Optional[str] = None
    ordered_at: datetime
    expected_completion_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    patient: Optional[PatientRead] = None
    order_tests: List[OrderTestRead] = []

    model_config = ConfigDict(from_attributes=True)


class OrderTimelineEvent(BaseModel):
    event: str
    timestamp: datetime
    performed_by: Optional[str] = None
    details: Optional[str] = None


class OrderTATRead(BaseModel):
    order_id: str
    order_uid: str
    ordered_at: datetime
    expected_completion_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    expected_tat_minutes: int
    actual_tat_minutes: Optional[int] = None
    is_overdue: bool
    status: OrderStatus
