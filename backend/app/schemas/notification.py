from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class NotificationRead(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: str
    message: str
    type: str
    is_read: bool
    reference_entity_type: Optional[str] = None
    reference_entity_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
