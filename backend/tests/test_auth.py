import pytest
import random
from fastapi.testclient import TestClient
from app.main import app
from app.data.database import engine, Base

# Wipe and recreate database tables specifically for these test sessions
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

client = TestClient(app)

@pytest.fixture(scope="module")
def random_suffix():
    """Generates a random number to avoid username collisions during multiple test runs."""
    return str(random.randint(1000, 9999))

def test_onboarding_and_gating_flow(random_suffix):
    owner_username = f"owner_{random_suffix}"
    staff_username = f"staff_{random_suffix}"
    password = "securepassword123"

    # ==========================================
    # STEP 1: Register Business Owner
    # ==========================================
    register_owner_payload = {
        "username": owner_username,
        "password": password,
        "role": "owner"
    }
    response = client.post("/auth/register", json=register_owner_payload)
    assert response.status_code == 201
    owner_data = response.json()
    assert owner_data["username"] == owner_username
    assert owner_data["role"] == "owner"
    assert owner_data["shop_id"] is None  # Owner does not have a shop yet

    # ==========================================
    # STEP 2: Duplicate Username Protection
    # ==========================================
    response = client.post("/auth/register", json=register_owner_payload)
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()

    # ==========================================
    # STEP 3: Log In as Business Owner
    # ==========================================
    login_payload = {
        "username": owner_username,
        "password": password
    }
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    owner_token = token_data["access_token"]

    # Set auth header for owner requests
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    # ==========================================
    # STEP 4: Owner Creates Their First Shop
    # ==========================================
    create_shop_payload = {
        "name": "Zilly's Ikeja Mega Plaza",
        "location": "Lagos, Nigeria"
    }
    response = client.post("/shops", json=create_shop_payload, headers=owner_headers)
    assert response.status_code == 201
    shop_data = response.json()
    assert shop_data["name"] == "Zilly's Ike Ikeja Mega Plaza" or "Ikeja" in shop_data["name"]
    assert shop_data["owner_id"] == owner_data["id"]
    shop_id = shop_data["id"]

    # ==========================================
    # STEP 5: Register Staff (Linked to Shop)
    # ==========================================
    # 5a. Fail registering staff without a shop_id
    bad_staff_payload = {
        "username": staff_username,
        "password": password,
        "role": "staff"
    }
    response = client.post("/auth/register", json=bad_staff_payload)
    assert response.status_code == 400
    assert "must be assigned to a specific shop" in response.json()["detail"].lower()

    # 5b. Success registering staff linked to shop_id
    good_staff_payload = {
        "username": staff_username,
        "password": password,
        "role": "staff",
        "shop_id": shop_id
    }
    response = client.post("/auth/register", json=good_staff_payload)
    assert response.status_code == 201
    staff_data = response.json()
    assert staff_data["username"] == staff_username
    assert staff_data["shop_id"] == shop_id

    # ==========================================
    # STEP 6: Log In as Staff Member
    # ==========================================
    staff_login_payload = {
        "username": staff_username,
        "password": password
    }
    response = client.post("/auth/login", json=staff_login_payload)
    assert response.status_code == 200
    staff_token_data = response.json()
    staff_token = staff_token_data["access_token"]
    staff_headers = {"Authorization": f"Bearer {staff_token}"}

    # ==========================================
    # STEP 7: Security Check (Role-Based Access Gating)
    # ==========================================
    # Staff attempts to register a new shop (should be BLOCKED - 403 Forbidden)
    evil_shop_payload = {
        "name": "Staff Owned Shop",
        "location": "Illegal Street"
    }
    response = client.post("/shops", json=evil_shop_payload, headers=staff_headers)
    assert response.status_code == 403
    assert "business owners only" in response.json()["detail"].lower()

    # ==========================================
    # STEP 8: Multi-Tenant Shop Isolation Check
    # ==========================================
    # 8a. Owner queries shops -> should see all their shops
    response = client.get("/shops", headers=owner_headers)
    assert response.status_code == 200
    owner_shops = response.json()
    assert len(owner_shops) >= 1
    assert any(s["id"] == shop_id for s in owner_shops)

    # 8b. Staff queries shops -> should see ONLY their single assigned shop
    response = client.get("/shops", headers=staff_headers)
    assert response.status_code == 200
    staff_shops = response.json()
    assert len(staff_shops) == 1
    assert staff_shops[0]["id"] == shop_id
