from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from app.utils.enums import Gender


class PatientBase(BaseModel):
    name: str
    age: int
    gender: Gender
    phone: str
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[Gender] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = None


class PatientRead(PatientBase):
    id: str
    patient_uid: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
