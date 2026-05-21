from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from config import settings

# Determine engine arguments based on database dialect.
# SQLite requires 'check_same_thread=False' for concurrent FastAPI threads, but Postgres does not.
engine_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}

# Create engine
engine = create_engine(settings.DATABASE_URL, **engine_args)

# Create SessionLocal class for handling session transactions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Modern SQLAlchemy 2.0 Declarative Base
class Base(DeclarativeBase):
    pass

# Dependency helper for FastAPI routes to inject database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
