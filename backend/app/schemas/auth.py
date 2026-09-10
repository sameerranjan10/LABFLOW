from pydantic import BaseModel, EmailStr
from app.utils.enums import UserRole
from app.schemas.user import UserRead


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    role: UserRole = UserRole.LAB_TECHNICIAN


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
