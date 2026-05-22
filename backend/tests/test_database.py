import os
from sqlalchemy import inspect
from app.data.database import engine, Base

def test_database_connection():
    """
    Verify that the database engine can successfully connect,
    initialize, and that the physical SQLite file is created.
    """
    # 1. Create all tables tracked by SQLAlchemy Base
    Base.metadata.create_all(bind=engine)
    
    # 2. Assert that the database file was physically created on disk
    # (Since we are in backend/ folder, the default path is ./inventory.db)
    assert os.path.exists("inventory.db") or os.path.exists("backend/inventory.db")
    
    # 3. Use SQLAlchemy Inspector to check active connections and metadata
    inspector = inspect(engine)
    assert inspector is not None
    
    print("\n✅ Pytest Database Connection check passed successfully!")
