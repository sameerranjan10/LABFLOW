from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.patient import Patient
from app.models.order import Order
from app.schemas.patient import PatientCreate, PatientUpdate
from app.utils.ids import generate_patient_uid
from app.services.audit_service import log_audit_event


def create_patient(db: Session, data: PatientCreate, performer_id: str) -> Patient:
    patient_uid = generate_patient_uid()

    # Ensure uniqueness of generated UID
    while db.query(Patient).filter(Patient.patient_uid == patient_uid).first():
        patient_uid = generate_patient_uid()

    patient = Patient(
        patient_uid=patient_uid,
        name=data.name,
        age=data.age,
        gender=data.gender,
        phone=data.phone,
        email=data.email,
        address=data.address,
        date_of_birth=data.date_of_birth
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    log_audit_event(
        db,
        action="PATIENT_CREATED",
        entity_type="Patient",
        entity_id=patient.id,
        user_id=performer_id,
        new_value={"patient_uid": patient.patient_uid, "name": patient.name}
    )

    return patient


def get_patients(
    db: Session,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20
) -> Tuple[List[Patient], int]:
    query = db.query(Patient)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Patient.patient_uid.ilike(search_pattern),
                Patient.name.ilike(search_pattern),
                Patient.phone.ilike(search_pattern),
                Patient.email.ilike(search_pattern)
            )
        )

    total = query.count()
    offset = (page - 1) * limit
    patients = query.order_by(Patient.created_at.desc()).offset(offset).limit(limit).all()

    return patients, total


def get_patient_by_id(db: Session, patient_id: str) -> Patient:
    patient = db.query(Patient).filter(
        or_(Patient.id == patient_id, Patient.patient_uid == patient_id)
    ).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID/UID '{patient_id}' not found"
        )
    return patient


def update_patient(
    db: Session,
    patient_id: str,
    data: PatientUpdate,
    performer_id: str
) -> Patient:
    patient = get_patient_by_id(db, patient_id)

    old_data = {"name": patient.name, "phone": patient.phone, "email": patient.email}

    update_dict = data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(patient, field, val)

    db.commit()
    db.refresh(patient)

    log_audit_event(
        db,
        action="PATIENT_UPDATED",
        entity_type="Patient",
        entity_id=patient.id,
        user_id=performer_id,
        old_value=old_data,
        new_value=update_dict
    )

    return patient


def delete_patient(db: Session, patient_id: str, performer_id: str) -> bool:
    patient = get_patient_by_id(db, patient_id)

    db.delete(patient)
    db.commit()

    log_audit_event(
        db,
        action="PATIENT_DELETED",
        entity_type="Patient",
        entity_id=patient_id,
        user_id=performer_id
    )

    return True


def get_patient_orders(db: Session, patient_id: str) -> List[Order]:
    patient = get_patient_by_id(db, patient_id)
    return db.query(Order).filter(Order.patient_id == patient.id).order_by(Order.ordered_at.desc()).all()
