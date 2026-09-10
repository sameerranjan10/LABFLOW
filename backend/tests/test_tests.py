import pytest


def test_test_catalog_crud(client, admin_headers):
    # 1. Create Test
    payload = {
        "test_code": "LIPID_TEST",
        "name": "Lipid Profile Test",
        "category": "Lipids",
        "sample_type": "Serum",
        "normal_range": "< 200",
        "unit": "mg/dL",
        "price": 45.0,
        "expected_tat_minutes": 90
    }
    res = client.post("/api/v1/tests", json=payload, headers=admin_headers)
    assert res.status_code == 201
    test_data = res.json()["data"]
    assert test_data["test_code"] == "LIPID_TEST"
    test_id = test_data["id"]

    # 2. Get Test
    get_res = client.get(f"/api/v1/tests/{test_id}")
    assert get_res.status_code == 200
    assert get_res.json()["data"]["category"] == "Lipids"

    # 3. List Categories
    cat_res = client.get("/api/v1/tests/categories")
    assert cat_res.status_code == 200
    assert "Lipids" in cat_res.json()["data"]

    # 4. Update Test
    up_res = client.put(f"/api/v1/tests/{test_id}", json={"price": 50.0}, headers=admin_headers)
    assert up_res.status_code == 200
    assert up_res.json()["data"]["price"] == 50.0

    # 5. Delete Test (Deactivate)
    del_res = client.delete(f"/api/v1/tests/{test_id}", headers=admin_headers)
    assert del_res.status_code == 200
    assert del_res.json()["data"]["deactivated"] is True
