import sys
import os
from datetime import datetime, date, timedelta, timezone

# Add parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.patient import Patient
from app.models.test import Test
from app.utils.enums import UserRole, Gender, OrderPriority
from app.schemas.order import OrderCreate
from app.services.order_service import create_order


def seed_database():
    print("🌱 Initializing database schema...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("🌱 Seeding Demo Users...")
        demo_users = [
            {
                "name": "Dr. Sarah Jenkins",
                "email": "admin@labflow.com",
                "phone": "+1-555-0100",
                "password": "AdminPass123!",
                "role": UserRole.ADMIN,
            },
            {
                "name": "Marcus Vance",
                "email": "manager@labflow.com",
                "phone": "+1-555-0101",
                "password": "ManagerPass123!",
                "role": UserRole.LAB_MANAGER,
            },
            {
                "name": "Dr. Aris Thorne",
                "email": "pathologist@labflow.com",
                "phone": "+1-555-0102",
                "password": "PathoPass123!",
                "role": UserRole.PATHOLOGIST,
            },
            {
                "name": "Elena Rostova",
                "email": "tech@labflow.com",
                "phone": "+1-555-0103",
                "password": "TechPass123!",
                "role": UserRole.LAB_TECHNICIAN,
            },
            {
                "name": "David Kim",
                "email": "receptionist@labflow.com",
                "phone": "+1-555-0104",
                "password": "ReceptPass123!",
                "role": UserRole.RECEPTIONIST,
            },
        ]

        created_users = {}
        for u in demo_users:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                user = User(
                    name=u["name"],
                    email=u["email"],
                    phone=u["phone"],
                    password_hash=get_password_hash(u["password"]),
                    role=u["role"],
                    is_active=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                created_users[u["role"]] = user
                print(f"   ✓ User Created: {u['email']} ({u['role'].value})")
            else:
                created_users[u["role"]] = existing
                print(f"   - User Exists: {u['email']}")

        print("\n🌱 Seeding Standard Test Catalog...")
        catalog = [
            {
                "test_code": "CBC",
                "name": "Complete Blood Count",
                "category": "Hematology",
                "description": "Measures RBC, WBC, Hemoglobin, Hematocrit, and Platelets.",
                "sample_type": "Whole Blood (EDTA)",
                "normal_range": "12.0 - 16.0",
                "unit": "g/dL",
                "price": 35.00,
                "expected_tat_minutes": 60,
            },
            {
                "test_code": "GLU_FASTING",
                "name": "Fasting Blood Sugar",
                "category": "Biochemistry",
                "description": "Measures blood glucose concentration after an overnight fast.",
                "sample_type": "Fluoride Plasma",
                "normal_range": "70 - 99",
                "unit": "mg/dL",
                "price": 15.00,
                "expected_tat_minutes": 45,
            },
            {
                "test_code": "HBA1C",
                "name": "Glycated Hemoglobin (HbA1c)",
                "category": "Biochemistry",
                "description": "Evaluates average blood sugar levels over the past 2 to 3 months.",
                "sample_type": "Whole Blood (EDTA)",
                "normal_range": "4.0 - 5.6",
                "unit": "%",
                "price": 45.00,
                "expected_tat_minutes": 90,
            },
            {
                "test_code": "LIPID",
                "name": "Lipid Profile Panel",
                "category": "Lipids",
                "description": "Includes Total Cholesterol, Triglycerides, HDL, and LDL.",
                "sample_type": "Serum",
                "normal_range": "< 200",
                "unit": "mg/dL",
                "price": 50.00,
                "expected_tat_minutes": 120,
            },
            {
                "test_code": "LFT",
                "name": "Liver Function Test",
                "category": "Biochemistry",
                "description": "Measures ALT, AST, Alkaline Phosphatase, Bilirubin, and Total Protein.",
                "sample_type": "Serum",
                "normal_range": "7 - 56",
                "unit": "U/L",
                "price": 60.00,
                "expected_tat_minutes": 120,
            },
            {
                "test_code": "KFT",
                "name": "Kidney Function Test",
                "category": "Biochemistry",
                "description": "Measures Serum Creatinine, Blood Urea Nitrogen (BUN), and Uric Acid.",
                "sample_type": "Serum",
                "normal_range": "0.6 - 1.2",
                "unit": "mg/dL",
                "price": 55.00,
                "expected_tat_minutes": 120,
            },
            {
                "test_code": "THYROID",
                "name": "Thyroid Profile (T3, T4, TSH)",
                "category": "Endocrinology",
                "description": "Evaluates thyroid gland function.",
                "sample_type": "Serum",
                "normal_range": "0.4 - 4.0",
                "unit": "uIU/mL",
                "price": 70.00,
                "expected_tat_minutes": 180,
            },
            {
                "test_code": "URINE_ROUTINE",
                "name": "Urinalysis Routine",
                "category": "Urinalysis",
                "description": "Physical, chemical, and microscopic exam of urine.",
                "sample_type": "Midstream Urine",
                "normal_range": "Clear / Normal",
                "unit": "N/A",
                "price": 20.00,
                "expected_tat_minutes": 45,
            },
        ]

        for t_data in catalog:
            existing = db.query(Test).filter(Test.test_code == t_data["test_code"]).first()
            if not existing:
                test_obj = Test(**t_data, is_active=True)
                db.add(test_obj)
                db.commit()
                print(f"   ✓ Test Catalog Added: {t_data['test_code']} - {t_data['name']}")

        print("\n🌱 Seeding Demo Patients & Orders...")
        demo_patients = [
            {
                "patient_uid": "PAT-2026-100001",
                "name": "Rahul Sharma",
                "age": 42,
                "gender": Gender.MALE,
                "phone": "+91-9876543210",
                "email": "rahul.sharma@example.com",
                "address": "102 Park Avenue, Connaught Place, New Delhi",
                "date_of_birth": date(1984, 5, 12),
            },
            {
                "patient_uid": "PAT-2026-100002",
                "name": "Priya Patel",
                "age": 31,
                "gender": Gender.FEMALE,
                "phone": "+91-9876543211",
                "email": "priya.patel@example.com",
                "address": "405 Green Meadows, Bandra West, Mumbai",
                "date_of_birth": date(1995, 8, 24),
            },
        ]

        patient_objs = []
        for p_data in demo_patients:
            existing = db.query(Patient).filter(Patient.patient_uid == p_data["patient_uid"]).first()
            if not existing:
                p_obj = Patient(**p_data)
                db.add(p_obj)
                db.commit()
                db.refresh(p_obj)
                patient_objs.append(p_obj)
                print(f"   ✓ Patient Created: {p_obj.name} ({p_obj.patient_uid})")
            else:
                patient_objs.append(existing)

        if patient_objs and created_users.get(UserRole.RECEPTIONIST):
            receptionist = created_users[UserRole.RECEPTIONIST]

            # Create demo order 1
            ex_order = db.query(Patient).filter(Patient.id == patient_objs[0].id).first()
            if ex_order and not ex_order.orders:
                create_order(
                    db,
                    OrderCreate(
                        patient_id=patient_objs[0].id,
                        tests=["CBC", "GLU_FASTING"],
                        priority=OrderPriority.STAT,
                        requested_by="Dr. Mehta (Emergency Dept)",
                        notes="Patient presenting with acute fatigue and fever."
                    ),
                    performer_id=receptionist.id
                )
                print("   ✓ Demo Order Created (STAT CBC & Glucose)")

        print("\n✅ Database seeding successfully completed!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
