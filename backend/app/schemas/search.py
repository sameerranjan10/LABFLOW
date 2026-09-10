from typing import List
from pydantic import BaseModel
from app.schemas.patient import PatientRead
from app.schemas.order import OrderRead
from app.schemas.sample import SampleRead
from app.schemas.report import ReportRead
from app.schemas.test import TestRead


class GlobalSearchResult(BaseModel):
    patients: List[PatientRead] = []
    orders: List[OrderRead] = []
    samples: List[SampleRead] = []
    reports: List[ReportRead] = []
    tests: List[TestRead] = []
