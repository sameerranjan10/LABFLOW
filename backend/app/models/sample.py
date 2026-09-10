from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from app.utils.enums import SampleStatus


class Sample(BaseModel):
    __tablename__ = "samples"

    sample_uid = Column(String(50), unique=True, index=True, nullable=False)
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    sample_type = Column(String(100), nullable=False)
    collection_status = Column(SQLEnum(SampleStatus), default=SampleStatus.PENDING, nullable=False, index=True)

    collected_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    collected_at = Column(DateTime(timezone=True), nullable=True)
    received_at = Column(DateTime(timezone=True), nullable=True)
    rejected_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)

    # Relationships
    order = relationship("Order", back_populates="samples")
    collector = relationship("User", foreign_keys=[collected_by])
