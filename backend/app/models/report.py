from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from app.utils.enums import ReportStatus


class Report(BaseModel):
    __tablename__ = "reports"

    report_uid = Column(String(50), unique=True, index=True, nullable=False)
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    generated_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    generated_at = Column(DateTime(timezone=True), nullable=True)
    verified_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)

    status = Column(SQLEnum(ReportStatus), default=ReportStatus.DRAFT, nullable=False, index=True)
    report_url = Column(String(500), nullable=True)

    # Relationships
    order = relationship("Order", back_populates="report")
    generator = relationship("User", foreign_keys=[generated_by])
    verifier = relationship("User", foreign_keys=[verified_by])
