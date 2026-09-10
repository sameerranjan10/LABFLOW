import pytest


def test_dashboard_endpoints(client, admin_headers, receptionist_headers):
    # Setup patient & test
    client.post("/api/v1/tests", json={
        "test_code": "DASH_TEST",
        "name": "Dashboard Test",
        "category": "Biochemistry",
        "sample_type": "Serum",
        "price": 20.0
    }, headers=admin_headers)

    p_res = client.post("/api/v1/patients", json={
        "name": "Dash Patient",
        "age": 40,
        "gender": "MALE",
        "phone": "+1-555-9999"
    }, headers=receptionist_headers)
    patient_id = p_res.json()["data"]["id"]

    client.post("/api/v1/orders", json={
        "patient_id": patient_id,
        "tests": ["DASH_TEST"],
        "priority": "STAT"
    }, headers=receptionist_headers)

    # 1. Summary
    sum_res = client.get("/api/v1/dashboard/summary", headers=admin_headers)
    assert sum_res.status_code == 200
    summary = sum_res.json()["data"]
    assert summary["total_orders"] >= 1
    assert summary["urgent_orders"] >= 1

    # 2. Status Distribution
    st_res = client.get("/api/v1/dashboard/order-status", headers=admin_headers)
    assert st_res.status_code == 200
    assert len(st_res.json()["data"]) >= 1

    # 3. Priority Distribution
    pr_res = client.get("/api/v1/dashboard/priority", headers=admin_headers)
    assert pr_res.status_code == 200

    # 4. Top Tests
    top_res = client.get("/api/v1/dashboard/tests", headers=admin_headers)
    assert top_res.status_code == 200
    assert len(top_res.json()["data"]) >= 1

    # 5. TAT Analytics
    tat_res = client.get("/api/v1/dashboard/tat", headers=admin_headers)
    assert tat_res.status_code == 200

    # 6. Global Search
    search_res = client.get("/api/v1/search?q=Dash", headers=admin_headers)
    assert search_res.status_code == 200
    search_data = search_res.json()["data"]
    assert len(search_data["patients"]) >= 1
