import pytest


def test_complete_laboratory_workflow(client, admin_headers, tech_headers, pathologist_headers, receptionist_headers):
    # 1. Add Test to Catalog (Admin)
    test_payload = {
        "test_code": "CBC_TEST",
        "name": "Complete Blood Count Test",
        "category": "Hematology",
        "sample_type": "Whole Blood",
        "normal_range": "12.0 - 16.0",
        "unit": "g/dL",
        "price": 30.00,
        "expected_tat_minutes": 60
    }
    t_res = client.post("/api/v1/tests", json=test_payload, headers=admin_headers)
    assert t_res.status_code == 201

    # 2. Register Patient (Receptionist)
    patient_payload = {
        "name": "Alice Smith",
        "age": 29,
        "gender": "FEMALE",
        "phone": "+1-555-8888",
        "email": "alice.smith@example.com"
    }
    p_res = client.post("/api/v1/patients", json=patient_payload, headers=receptionist_headers)
    assert p_res.status_code == 201
    patient_id = p_res.json()["data"]["id"]

    # 3. Create Order (Receptionist)
    order_payload = {
        "patient_id": patient_id,
        "tests": ["CBC_TEST"],
        "priority": "URGENT",
        "notes": "Routine preoperative checkup"
    }
    o_res = client.post("/api/v1/orders", json=order_payload, headers=receptionist_headers)
    assert o_res.status_code == 201
    order_data = o_res.json()["data"]
    order_id = order_data["id"]
    order_uid = order_data["order_uid"]
    assert order_uid.startswith("LAB-")
    assert order_data["status"] == "SAMPLE_PENDING"

    # Get sample ID created automatically for whole blood
    s_res = client.get(f"/api/v1/samples?order_id={order_id}", headers=tech_headers)
    assert s_res.status_code == 200
    samples = s_res.json()["data"]
    assert len(samples) == 1
    sample_id = samples[0]["id"]

    # 4. Collect Sample (Tech)
    sc_res = client.post(f"/api/v1/samples/{sample_id}/collect", headers=tech_headers)
    assert sc_res.status_code == 200
    assert sc_res.json()["data"]["collection_status"] == "COLLECTED"

    # 5. Receive Sample (Tech)
    sr_res = client.post(f"/api/v1/samples/{sample_id}/receive", headers=tech_headers)
    assert sr_res.status_code == 200
    assert sr_res.json()["data"]["collection_status"] == "RECEIVED"

    # 6. Start Processing (Tech)
    sp_res = client.post(f"/api/v1/samples/{sample_id}/start-processing", headers=tech_headers)
    assert sp_res.status_code == 200
    assert sp_res.json()["data"]["collection_status"] == "PROCESSING"

    # 7. Enter Test Result (Tech)
    order_test_id = order_data["order_tests"][0]["id"]
    result_payload = {
        "order_test_id": order_test_id,
        "value": "13.5",
        "numeric_value": 13.5,
        "comments": "Normal hemoglobin level"
    }
    r_res = client.post("/api/v1/results", json=result_payload, headers=tech_headers)
    assert r_res.status_code == 201
    result_data = r_res.json()["data"]
    result_id = result_data["id"]
    assert result_data["flag"] == "NORMAL"
    assert result_data["status"] == "ENTERED"

    # 8. Verify Result (Pathologist)
    vr_res = client.post(f"/api/v1/results/{result_id}/verify", headers=pathologist_headers)
    assert vr_res.status_code == 200
    assert vr_res.json()["data"]["status"] == "VERIFIED"

    # 9. Generate Report (Tech / Pathologist)
    rg_res = client.post(f"/api/v1/reports/{order_id}/generate", headers=pathologist_headers)
    assert rg_res.status_code == 201
    report_data = rg_res.json()["data"]
    report_id = report_data["id"]

    # 10. Verify Report (Pathologist)
    rv_res = client.post(f"/api/v1/reports/{report_id}/verify", headers=pathologist_headers)
    assert rv_res.status_code == 200
    assert rv_res.json()["data"]["status"] == "VERIFIED"

    # 11. Publish Report (Pathologist)
    rp_res = client.post(f"/api/v1/reports/{report_id}/publish", headers=pathologist_headers)
    assert rp_res.status_code == 200
    assert rp_res.json()["data"]["status"] == "PUBLISHED"

    # 12. Verify Order is COMPLETED
    chk_order = client.get(f"/api/v1/orders/{order_id}", headers=pathologist_headers)
    assert chk_order.status_code == 200
    assert chk_order.json()["data"]["status"] == "COMPLETED"

    # 13. Verify Dashboard Summary
    dash_res = client.get("/api/v1/dashboard/summary", headers=pathologist_headers)
    assert dash_res.status_code == 200
    summary = dash_res.json()["data"]
    assert summary["completed_orders"] >= 1
