from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.utils.enums import SampleStatus


class SampleCreate(BaseModel):
    order_id: str
    sample_type: str


class SampleUpdate(BaseModel):
    sample_type: Optional[str] = None
    collection_status: Optional[SampleStatus] = None


class SampleRejectRequest(BaseModel):
    rejection_reason: str


class SampleRead(BaseModel):
    id: str
    sample_uid: str
    order_id: str
    sample_type: str
    collection_status: SampleStatus
    collected_by: Optional[str] = None
    collected_at: Optional[datetime] = None
    received_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
