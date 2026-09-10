import pytest


def test_patient_crud(client, receptionist_headers):
    # 1. Create Patient
    patient_payload = {
        "name": "Robert Paulson",
        "age": 45,
        "gender": "MALE",
        "phone": "+1-555-4321",
        "email": "robert.paulson@example.com",
        "address": "742 Evergreen Terrace",
        "date_of_birth": "1981-04-15"
    }
    res = client.post("/api/v1/patients", json=patient_payload, headers=receptionist_headers)
    assert res.status_code == 201
    patient_data = res.json()["data"]
    assert patient_data["name"] == "Robert Paulson"
    assert patient_data["patient_uid"].startswith("PAT-")
    patient_id = patient_data["id"]

    # 2. Get Patient by ID
    get_res = client.get(f"/api/v1/patients/{patient_id}", headers=receptionist_headers)
    assert get_res.status_code == 200
    assert get_res.json()["data"]["patient_uid"] == patient_data["patient_uid"]

    # 3. List Patients with search
    list_res = client.get("/api/v1/patients?search=Paulson", headers=receptionist_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()["data"]) == 1

    # 4. Update Patient
    update_res = client.put(f"/api/v1/patients/{patient_id}", json={"age": 46}, headers=receptionist_headers)
    assert update_res.status_code == 200
    assert update_res.json()["data"]["age"] == 46
