from sqlalchemy import Column, String, Integer, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from app.utils.enums import Gender


class Patient(BaseModel):
    __tablename__ = "patients"

    patient_uid = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), index=True, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(SQLEnum(Gender), nullable=False)
    phone = Column(String(50), index=True, nullable=False)
    email = Column(String(255), index=True, nullable=True)
    address = Column(String(500), nullable=True)
    date_of_birth = Column(Date, nullable=True)

    # Relationships
    orders = relationship("Order", back_populates="patient", cascade="all, delete-orphan")
