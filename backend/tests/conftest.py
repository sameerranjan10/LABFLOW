import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add app directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set SQLite in-memory database URL for testing prior to settings import
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.main import app
from app.core.database import Base, get_db
from app.core.security import get_password_hash, create_access_token
from app.models.user import User
from app.utils.enums import UserRole

from sqlalchemy.pool import StaticPool

# Use SQLite in-memory database for fast, isolated tests
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(db_session):
    user = User(
        name="Admin Test User",
        email="admin_test@labflow.com",
        password_hash=get_password_hash("TestPass123!"),
        role=UserRole.ADMIN,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def admin_token(admin_user):
    return create_access_token(subject=admin_user.id, role=admin_user.role.value)


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def tech_user(db_session):
    user = User(
        name="Tech Test User",
        email="tech_test@labflow.com",
        password_hash=get_password_hash("TestPass123!"),
        role=UserRole.LAB_TECHNICIAN,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def tech_headers(tech_user):
    token = create_access_token(subject=tech_user.id, role=tech_user.role.value)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def pathologist_user(db_session):
    user = User(
        name="Pathologist Test User",
        email="patho_test@labflow.com",
        password_hash=get_password_hash("TestPass123!"),
        role=UserRole.PATHOLOGIST,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def pathologist_headers(pathologist_user):
    token = create_access_token(subject=pathologist_user.id, role=pathologist_user.role.value)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def receptionist_user(db_session):
    user = User(
        name="Receptionist Test User",
        email="recept_test@labflow.com",
        password_hash=get_password_hash("TestPass123!"),
        role=UserRole.RECEPTIONIST,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def receptionist_headers(receptionist_user):
    token = create_access_token(subject=receptionist_user.id, role=receptionist_user.role.value)
    return {"Authorization": f"Bearer {token}"}
