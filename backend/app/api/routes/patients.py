from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_roles
from app.utils.enums import UserRole
from app.models.user import User
from app.schemas.patient import PatientRead, PatientCreate, PatientUpdate
from app.schemas.order import OrderRead
from app.schemas.common import SuccessResponse, PaginatedResponse, PaginationMeta
from app.services.patient_service import (
    create_patient, get_patients, get_patient_by_id, update_patient, delete_patient, get_patient_orders
)

router = APIRouter(prefix="/patients", tags=["Patient Management"])


@router.post("", response_model=SuccessResponse[PatientRead], status_code=status.HTTP_201_CREATED)
def register_patient_endpoint(
    req: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.RECEPTIONIST]))
):
    """Register a new patient"""
    patient = create_patient(db, req, performer_id=current_user.id)
    return SuccessResponse(data=PatientRead.model_validate(patient), message="Patient registered successfully")


@router.get("", response_model=PaginatedResponse[PatientRead])
def list_patients(
    search: Optional[str] = Query(None, description="Search by UID, name, phone, email"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.RECEPTIONIST, UserRole.LAB_TECHNICIAN, UserRole.PATHOLOGIST]))
):
    """List patients with optional search and pagination"""
    patients, total = get_patients(db, search=search, page=page, limit=limit)
    pages = (total + limit - 1) // limit if total > 0 else 1

    return PaginatedResponse(
        data=[PatientRead.model_validate(p) for p in patients],
        pagination=PaginationMeta(page=page, limit=limit, total=total, pages=pages)
    )


@router.get("/{patient_id}", response_model=SuccessResponse[PatientRead])
def get_patient(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.RECEPTIONIST, UserRole.LAB_TECHNICIAN, UserRole.PATHOLOGIST]))
):
    """Get patient profile by internal ID or patient UID"""
    patient = get_patient_by_id(db, patient_id)
    return SuccessResponse(data=PatientRead.model_validate(patient))


@router.put("/{patient_id}", response_model=SuccessResponse[PatientRead])
def update_patient_endpoint(
    patient_id: str,
    req: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.RECEPTIONIST]))
):
    """Update patient demographic profile"""
    patient = update_patient(db, patient_id, req, performer_id=current_user.id)
    return SuccessResponse(data=PatientRead.model_validate(patient), message="Patient profile updated")


@router.delete("/{patient_id}", response_model=SuccessResponse[dict])
def delete_patient_endpoint(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER]))
):
    """Delete patient record (Admin & Manager only)"""
    delete_patient(db, patient_id, performer_id=current_user.id)
    return SuccessResponse(data={"deleted": True}, message="Patient record deleted")


@router.get("/{patient_id}/orders", response_model=SuccessResponse[List[OrderRead]])
def list_patient_orders(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.RECEPTIONIST, UserRole.LAB_TECHNICIAN, UserRole.PATHOLOGIST]))
):
    """Get all test orders for a given patient"""
    orders = get_patient_orders(db, patient_id)
    return SuccessResponse(data=[OrderRead.model_validate(o) for o in orders])


@router.get("/{patient_id}/history", response_model=SuccessResponse[List[OrderRead]])
def get_patient_history(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.LAB_MANAGER, UserRole.RECEPTIONIST, UserRole.LAB_TECHNICIAN, UserRole.PATHOLOGIST]))
):
    """Get complete clinical test history for a patient"""
    orders = get_patient_orders(db, patient_id)
    return SuccessResponse(data=[OrderRead.model_validate(o) for o in orders])
