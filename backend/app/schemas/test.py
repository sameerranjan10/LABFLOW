from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class TestBase(BaseModel):
    test_code: str
    name: str
    category: str
    description: Optional[str] = None
    sample_type: str
    normal_range: Optional[str] = None
    unit: Optional[str] = None
    price: float = 0.0
    expected_tat_minutes: int = 120
    is_active: bool = True


class TestCreate(TestBase):
    pass


class TestUpdate(BaseModel):
    test_code: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    sample_type: Optional[str] = None
    normal_range: Optional[str] = None
    unit: Optional[str] = None
    price: Optional[float] = None
    expected_tat_minutes: Optional[int] = None
    is_active: Optional[bool] = None


class TestRead(TestBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
