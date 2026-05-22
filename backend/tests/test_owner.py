import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.data.database import engine, Base
from app.data.models.transaction import TransactionStatus
from datetime import datetime, timedelta

# Ensure a fresh DB for this test module
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_data():
    # 1. Register Owner
    owner_payload = {
        "username": "owner_user",
        "password": "strongpass123",
        "role": "owner",
    }
    client.post("/auth/register", json=owner_payload)
    login_resp = client.post("/auth/login", json={"username": owner_payload["username"], "password": owner_payload["password"]})
    owner_token = login_resp.json()["access_token"]
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    # 2. Create Shop (must happen before staff registration)
    shop_resp = client.post("/shops", json={"name": "Owner Test Shop", "location": "Lagos"}, headers=owner_headers)
    shop_id = shop_resp.json()["id"]

    # 3. Register Staff (assigned to the created shop)
    staff_payload = {
        "username": "staff_user",
        "password": "strongpass123",
        "role": "staff",
        "shop_id": shop_id
    }
    client.post("/auth/register", json=staff_payload)
    staff_login_resp = client.post("/auth/login", json={"username": staff_payload["username"], "password": staff_payload["password"]})
    staff_token = staff_login_resp.json()["access_token"]
    staff_headers = {"Authorization": f"Bearer {staff_token}"}

    # 4. Create Category
    cat_resp = client.post("/categories/", json={"name": "Owner Electronics"}, headers=owner_headers)
    cat_id = cat_resp.json()["id"]

    # 5. Create Product
    prod_resp = client.post("/products/", json={
        "brand_model": "Owner TV",
        "serial_number": "TV123",
        "price": 1000.0,
        "status": "in_stock",
        "category_id": cat_id,
        "shop_id": shop_id
    }, headers=owner_headers)
    product_id = prod_resp.json()["id"]

    # 6. Seed Transactions
    from app.data.database import SessionLocal
    from app.data.models.transaction import Transaction
    db = SessionLocal()
    
    tx1 = Transaction(shop_id=shop_id, product_id=product_id, serial_number="TV123", status=TransactionStatus.COMPLETED)
    tx2 = Transaction(shop_id=shop_id, product_id=product_id, serial_number="TV124", status=TransactionStatus.FAILED)
    tx3 = Transaction(shop_id=shop_id, product_id=product_id, serial_number="TV125", status=TransactionStatus.PENDING)
    
    db.add_all([tx1, tx2, tx3])
    db.commit()
    db.close()

    return {
        "owner_headers": owner_headers,
        "staff_headers": staff_headers,
        "shop_id": shop_id
    }

def test_owner_dashboard(setup_data):
    headers = setup_data["owner_headers"]
    
    resp = client.get("/dashboard/overview", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_sales_count"] == 1
    assert data["total_revenue"] == 1000.0
    assert data["total_errors"] == 1

def test_owner_dashboard_staff_forbidden(setup_data):
    headers = setup_data["staff_headers"]
    
    resp = client.get("/dashboard/overview", headers=headers)
    assert resp.status_code == 403

def test_transactions_list(setup_data):
    headers = setup_data["owner_headers"]
    shop_id = setup_data["shop_id"]
    
    # All transactions
    resp = client.get(f"/transactions?shop_id={shop_id}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 3

    # Filter by status = COMPLETED
    resp = client.get(f"/transactions?shop_id={shop_id}&status=completed", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["status"] == "completed"

def test_transactions_list_unauthorized_shop(setup_data):
    headers = setup_data["owner_headers"]
    # Trying to fetch shop 999 which owner doesn't own or doesn't exist
    resp = client.get(f"/transactions?shop_id=999", headers=headers)
    assert resp.status_code == 403
