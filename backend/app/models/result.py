from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from app.utils.enums import ResultStatus, ResultFlag


class Result(BaseModel):
    __tablename__ = "results"

    order_test_id = Column(String(36), ForeignKey("order_tests.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=False)  # String representation (e.g., "12.5" or "Positive")
    numeric_value = Column(Float, nullable=True)  # Numeric value if applicable
    unit = Column(String(50), nullable=True)
    reference_range = Column(String(255), nullable=True)
    flag = Column(SQLEnum(ResultFlag), default=ResultFlag.NORMAL, nullable=False)

    entered_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    entered_at = Column(DateTime(timezone=True), nullable=True)
    verified_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)

    status = Column(SQLEnum(ResultStatus), default=ResultStatus.DRAFT, nullable=False, index=True)
    comments = Column(Text, nullable=True)

    # Relationships
    order_test = relationship("OrderTest", back_populates="result")
    entered_user = relationship("User", foreign_keys=[entered_by])
    verified_user = relationship("User", foreign_keys=[verified_by])
