from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from app.utils.enums import OrderPriority, OrderStatus, OrderTestStatus


class Order(BaseModel):
    __tablename__ = "orders"

    order_uid = Column(String(50), unique=True, index=True, nullable=False)
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    requested_by = Column(String(255), nullable=True)  # Doctor name or department
    priority = Column(SQLEnum(OrderPriority), default=OrderPriority.ROUTINE, nullable=False, index=True)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.CREATED, nullable=False, index=True)
    notes = Column(Text, nullable=True)

    ordered_at = Column(DateTime(timezone=True), nullable=False)
    expected_completion_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="orders")
    order_tests = relationship("OrderTest", back_populates="order", cascade="all, delete-orphan")
    samples = relationship("Sample", back_populates="order", cascade="all, delete-orphan")
    report = relationship("Report", back_populates="order", uselist=False, cascade="all, delete-orphan")


class OrderTest(BaseModel):
    __tablename__ = "order_tests"

    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    test_id = Column(String(36), ForeignKey("tests.id", ondelete="RESTRICT"), nullable=False, index=True)
    status = Column(SQLEnum(OrderTestStatus), default=OrderTestStatus.PENDING, nullable=False)
    assigned_to = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    order = relationship("Order", back_populates="order_tests")
    test = relationship("Test", back_populates="order_tests")
    assigned_user = relationship("User", foreign_keys=[assigned_to])
    result = relationship("Result", back_populates="order_test", uselist=False, cascade="all, delete-orphan")
