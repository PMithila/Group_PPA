""
Test script to verify database connectivity and basic operations.
"""
import sys
import os
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent))

from app.db import init_db, health_check, get_session
from sqlmodel import SQLModel, Field

# Define a simple test model
class TestItem(SQLModel, table=True):
    __tablename__ = "test_items"
    
    id: int = Field(default=None, primary_key=True)
    name: str
    description: str = None

def main():
    print("Testing database connection...")
    
    # Test database health check
    health = health_check()
    print(f"Database health check: {health}")
    
    # Initialize database (create tables)
    print("Initializing database...")
    init_db()
    
    # Test session and basic CRUD operations
    print("Testing database operations...")
    with get_session() as session:
        # Create a test item
        test_item = TestItem(name="Test Item", description="This is a test item")
        session.add(test_item)
        session.commit()
        session.refresh(test_item)
        print(f"Created test item with ID: {test_item.id}")
        
        # Read the test item
        read_item = session.get(TestItem, test_item.id)
        print(f"Read test item: {read_item}")
        
        # Clean up
        session.delete(read_item)
        session.commit()
        print("Test item deleted")
    
    print("\nDatabase test completed successfully!")

if __name__ == "__main__":
    main()
