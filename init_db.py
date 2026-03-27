import os
from sqlalchemy import create_engine, text

def init_db():
    try:
        # Connect to default postgres to create database
        engine_default = create_engine("postgresql://postgres:postgres@127.0.0.1/postgres", isolation_level="AUTOCOMMIT")
        with engine_default.connect() as conn:
            try:
                conn.execute(text("CREATE DATABASE medibill_ai"))
                print("Created database medibill_ai")
            except Exception as e:
                print("Database might already exist:", e)
    except Exception as e:
        print("Failed to connect to postgres server:", e)
        return

    # Connect to medibill_ai and run SQL
    try:
        engine = create_engine("postgresql://postgres:postgres@127.0.0.1/medibill_ai", isolation_level="AUTOCOMMIT")
        with engine.connect() as conn:
            with open('database/schema.sql', 'r') as f:
                schema_sql = f.read()
                # Split by semicolon to run statements individually if needed, but SQLAlchemy text can handle multiple in some drivers.
                # psycopg2 handles multiple commands in one text block.
                conn.execute(text(schema_sql))
                print("Executed schema.sql")
                
            with open('database/seed_data.sql', 'r') as f:
                seed_sql = f.read()
                conn.execute(text(seed_sql))
                print("Executed seed_data.sql")
        print("Successfully initialized database!")
    except Exception as e:
        print("Error executing SQL:", e)

if __name__ == "__main__":
    init_db()
