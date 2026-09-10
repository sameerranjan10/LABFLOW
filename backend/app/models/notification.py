from sqlalchemy import Column, String, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Notification(BaseModel):
    __tablename__ = "notifications"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)  # Null means system-wide
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False, default="INFO")  # e.g., CRITICAL_RESULT, OVERDUE_ORDER, URGENT_ORDER
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    reference_entity_type = Column(String(50), nullable=True)
    reference_entity_id = Column(String(100), nullable=True)

    # Relationships
    user = relationship("User", back_populates="notifications")
