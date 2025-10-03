"""
Database configuration and session management for EduSyncX1.

This module provides database connection handling, session management, and
utility functions for the application's data layer.
"""
import os
from contextlib import contextmanager
from typing import Generator, Optional

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker, Session as DBSession
from sqlmodel import SQLModel

# Database configuration
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./adv_timetable.db")
POOL_SIZE = int(os.environ.get("DB_POOL_SIZE", 5))
MAX_OVERFLOW = int(os.environ.get("DB_MAX_OVERFLOW", 10))
POOL_TIMEOUT = int(os.environ.get("DB_POOL_TIMEOUT", 30))
POOL_RECYCLE = int(os.environ.get("DB_POOL_RECYCLE", 3600))

# Database engine configuration
engine_kwargs = {
    "pool_size": POOL_SIZE,
    "max_overflow": MAX_OVERFLOW,
    "pool_timeout": POOL_TIMEOUT,
    "pool_recycle": POOL_RECYCLE,
    "pool_pre_ping": True,  # Enable connection health checks
    "echo": os.environ.get("SQL_ECHO", "false").lower() == "true"  # Log SQL queries
}

# SQLite specific configuration
if "sqlite" in DATABASE_URL:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
    # Enable WAL mode for better concurrency
    engine_kwargs["connect_args"].update({"timeout": 30})
    engine_kwargs["poolclass"] = None  # Use NullPool for SQLite

# Create database engine
engine: Engine = create_engine(DATABASE_URL, **engine_kwargs)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=True
)


def init_db() -> None:
    """Initialize database by creating all tables.
    
    This function should be called during application startup to ensure
    all database tables are created.
    """
    try:
        SQLModel.metadata.create_all(engine)
        print("Database tables created successfully.")
    except SQLAlchemyError as e:
        print(f"Error creating database tables: {e}")
        raise


@contextmanager
def get_session() -> Generator[DBSession, None, None]:
    """Provide a transactional scope around a series of operations.
    
    Yields:
        SQLAlchemy database session
        
    Example:
        with get_session() as session:
            result = session.query(User).all()
    """
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except SQLAlchemyError as e:
        session.rollback()
        print(f"Database error occurred: {e}")
        raise
    finally:
        session.close()


def get_db() -> Generator[DBSession, None, None]:
    """Dependency for FastAPI to get DB session.
    
    This is the recommended way to get a database session in FastAPI route handlers.
    
    Example:
        @app.get("/items/")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    with get_session() as session:
        yield session


def health_check() -> dict:
    """Check database connection health.
    
    Returns:
        dict: Status of the database connection
    """
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        return {"status": "healthy", "database": DATABASE_URL.split("@")[-1].split("/")[-1]}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
