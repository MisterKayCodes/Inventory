import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.data.database import engine, Base

# Ensure a fresh DB for this test module
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

client = TestClient(app)

@pytest.fixture(scope="module")
def owner_token_and_shop():
    # Register owner
    owner_payload = {
        "username": "owner_test",
        "password": "strongpass123",
        "role": "owner",
    }
    resp = client.post("/auth/register", json=owner_payload)
    assert resp.status_code == 201
    # Login owner
    login_resp = client.post("/auth/login", json={"username": owner_payload["username"], "password": owner_payload["password"]})
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    # Create shop
    shop_resp = client.post("/shops", json={"name": "Zilly Test Shop", "location": "Lagos"}, headers=headers)
    assert shop_resp.status_code == 201
    shop_id = shop_resp.json()["id"]
    return headers, shop_id

def test_category_crud(owner_token_and_shop):
    headers, shop_id = owner_token_and_shop
    # Create a category
    cat_payload = {"name": "Laptops"}
    create_resp = client.post("/categories/", json=cat_payload, headers=headers)
    assert create_resp.status_code == 201
    cat = create_resp.json()
    assert cat["name"] == "Laptops"
    cat_id = cat["id"]

    # List categories
    list_resp = client.get("/categories/", headers=headers)
    assert list_resp.status_code == 200
    cats = list_resp.json()
    assert any(c["id"] == cat_id for c in cats)

    # Get single category
    get_resp = client.get(f"/categories/{cat_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == "Laptops"

    # Update category
    update_resp = client.put(f"/categories/{cat_id}", json={"name": "Notebooks"}, headers=headers)
    assert update_resp.status_code == 200
    assert update_resp.json()["name"] == "Notebooks"

    # Delete category
    del_resp = client.delete(f"/categories/{cat_id}", headers=headers)
    assert del_resp.status_code == 204
    # Verify deletion
    after_del = client.get(f"/categories/{cat_id}", headers=headers)
    assert after_del.status_code == 404

def test_product_crud(owner_token_and_shop):
    headers, shop_id = owner_token_and_shop
    # First create a category for the product to belong to
    cat_resp = client.post("/categories/", json={"name": "Phones"}, headers=headers)
    assert cat_resp.status_code == 201
    category_id = cat_resp.json()["id"]

    # Create a product
    prod_payload = {
        "brand_model": "iPhone 15",
        "serial_number": "SN123456789",
        "price": 299.99,
        "status": "in_stock",
        "photo_url": None,
        "category_id": category_id,
    }
    create_resp = client.post("/products/", json=prod_payload, headers=headers)
    assert create_resp.status_code == 201
    product = create_resp.json()
    prod_id = product["id"]

    # List products
    list_resp = client.get("/products/", headers=headers)
    assert list_resp.status_code == 200
    products = list_resp.json()
    assert any(p["id"] == prod_id for p in products)

    # Get single product
    get_resp = client.get(f"/products/{prod_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["brand_model"] == "iPhone 15"

    # Update product (change price and status)
    update_resp = client.put(
        f"/products/{prod_id}",
        json={"price": 279.99, "status": "reserved"},
        headers=headers,
    )
    assert update_resp.status_code == 200
    updated = update_resp.json()
    assert updated["price"] == 279.99
    assert updated["status"] == "reserved"

    # Delete product
    del_resp = client.delete(f"/products/{prod_id}", headers=headers)
    assert del_resp.status_code == 204
    # Verify deletion
    after_del = client.get(f"/products/{prod_id}", headers=headers)
    assert after_del.status_code == 404
