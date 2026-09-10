from sqlalchemy import Column, String, Float, Integer, Boolean, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Test(BaseModel):
    __tablename__ = "tests"

    test_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), index=True, nullable=False)
    category = Column(String(100), index=True, nullable=False)  # e.g., Hematology, Biochemistry
    description = Column(Text, nullable=True)
    sample_type = Column(String(100), index=True, nullable=False)  # e.g., Blood, Urine
    normal_range = Column(String(255), nullable=True)  # e.g., "70 - 100", "< 200"
    unit = Column(String(50), nullable=True)  # e.g., mg/dL, g/dL
    price = Column(Float, nullable=False, default=0.0)
    expected_tat_minutes = Column(Integer, nullable=False, default=120)
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Relationships
    order_tests = relationship("OrderTest", back_populates="test")
