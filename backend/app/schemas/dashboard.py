from typing import List, Dict
from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_orders: int
    pending_orders: int
    processing_orders: int
    completed_orders: int
    urgent_orders: int
    overdue_orders: int
    total_patients: int


class DashboardStatusCount(BaseModel):
    status: str
    count: int


class DashboardPriorityCount(BaseModel):
    priority: str
    count: int


class DashboardTopTest(BaseModel):
    test_code: str
    name: str
    count: int


class DashboardTATSummary(BaseModel):
    average_tat_minutes: float
    median_tat_minutes: float
    completed_within_tat_count: int
    overdue_count: int
    overdue_percentage: float


class DashboardActivityItem(BaseModel):
    id: str
    action: str
    entity_type: str
    entity_id: str
    user_name: str
    timestamp: str
    details: str


class DashboardTrendItem(BaseModel):
    date: str
    order_count: int
    completed_count: int
