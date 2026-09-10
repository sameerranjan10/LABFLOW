from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.utils.enums import ResultStatus, ResultFlag


class ResultCreate(BaseModel):
    order_test_id: str
    value: str
    numeric_value: Optional[float] = None
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    comments: Optional[str] = None


class ResultUpdate(BaseModel):
    value: Optional[str] = None
    numeric_value: Optional[float] = None
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    flag: Optional[ResultFlag] = None
    comments: Optional[str] = None


class ResultRead(BaseModel):
    id: str
    order_test_id: str
    value: str
    numeric_value: Optional[float] = None
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    flag: ResultFlag
    entered_by: Optional[str] = None
    entered_at: Optional[datetime] = None
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    status: ResultStatus
    comments: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
