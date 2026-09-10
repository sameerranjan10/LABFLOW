import pytest


def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_user_registration_and_login(client):
    # 1. Register User
    reg_payload = {
        "name": "Jane Doe",
        "email": "jane.doe@labflow.com",
        "phone": "+1-555-0199",
        "password": "SecurePassword123!",
        "role": "LAB_TECHNICIAN"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["data"]["email"] == "jane.doe@labflow.com"

    # 2. Login User
    login_payload = {
        "email": "jane.doe@labflow.com",
        "password": "SecurePassword123!"
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token_data = login_res.json()["data"]
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 3. Get Profile (Me)
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["data"]["name"] == "Jane Doe"


def test_invalid_login(client):
    res = client.post("/api/v1/auth/login", json={"email": "nonexistent@labflow.com", "password": "wrong"})
    assert res.status_code == 401
    assert res.json()["success"] is False
