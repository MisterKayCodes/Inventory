import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.data.database import engine, Base

# Reset the DB for a fresh test run
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

client = TestClient(app)

@pytest.fixture(scope="module")
def auth_headers_owner():
    # Register an owner
    owner_payload = {"username": "owner_tx", "password": "secret123", "role": "owner"}
    resp = client.post("/auth/register", json=owner_payload)
    assert resp.status_code == 201
    # Log in
    login = client.post("/auth/login", json={"username": owner_payload["username"], "password": owner_payload["password"]})
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="module")
def shop_id(auth_headers_owner):
    # Owner creates a shop
    shop_payload = {"name": "Test Shop", "location": "Nowhere"}
    resp = client.post("/shops", json=shop_payload, headers=auth_headers_owner)
    assert resp.status_code == 201
    return resp.json()["id"]

@pytest.fixture(scope="module")
def product_id(auth_headers_owner, shop_id):
    # Owner creates a product with a known serial
    product_payload = {
        "shop_id": shop_id,
        "category_id": 1,  # assuming a default category exists (create if needed)
        "brand_model": "Gadget X",
        "serial_number": "ABC-123-XYZ",
        "price": 199.99,
        "status": "in_stock"
    }
    # Ensure at least one category exists
    cat_resp = client.get("/categories", headers=auth_headers_owner)
    if cat_resp.status_code != 200 or not cat_resp.json():
        cat_payload = {"name": "Default"}
        cat_resp = client.post("/categories", json=cat_payload, headers=auth_headers_owner)
        assert cat_resp.status_code == 201
        category_id = cat_resp.json()["id"]
    else:
        category_id = cat_resp.json()[0]["id"]
    product_payload["category_id"] = category_id
    resp = client.post("/products", json=product_payload, headers=auth_headers_owner)
    assert resp.status_code == 201
    return resp.json()["id"]

def test_verify_and_confirm_transaction(auth_headers_owner, shop_id, product_id):
    # Verify the serial number
    verify_payload = {"shop_id": shop_id, "serial": "ABC-123-XYZ"}
    verify_resp = client.post("/transactions/verify", json=verify_payload, headers=auth_headers_owner)
    assert verify_resp.status_code == 200
    data = verify_resp.json()
    assert data["matched"] is True
    assert data["product_id"] == product_id

    # Confirm the sale with an idempotency key
    idemp_key = "unique-key-001"
    confirm_payload = {
        "shop_id": shop_id,
        "product_id": product_id,
        "serial": "ABC-123-XYZ",
        "idempotency_key": idemp_key,
    }
    confirm_resp = client.post("/transactions/confirm-sale", json=confirm_payload, headers=auth_headers_owner)
    assert confirm_resp.status_code == 200
    txn_data = confirm_resp.json()
    assert "transaction_id" in txn_data
    assert txn_data["status"] == "completed"

    # Re‑send the same request – should get a 409 conflict and no new transaction
    duplicate_resp = client.post("/transactions/confirm-sale", json=confirm_payload, headers=auth_headers_owner)
    assert duplicate_resp.status_code == 409
    assert "Duplicate transaction" in duplicate_resp.json()["detail"]
