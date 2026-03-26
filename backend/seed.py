from .database import SessionLocal, engine
from . import models

def seed_db():
    db = SessionLocal()
    
    # Sample CGHS + NPPA Data
    sample_data = [
        {"item_name": "Paracetamol 500mg", "benchmark_price": 2.0},
        {"item_name": "CBC Test", "benchmark_price": 400.0},
        {"item_name": "ICU Charges/day", "benchmark_price": 11000.0},
        {"item_name": "Surgical Gloves", "benchmark_price": 180.0},
        {"item_name": "X-Ray", "benchmark_price": 300.0},
    ]

    for item in sample_data:
        existing_item = db.query(models.RateCard).filter(models.RateCard.item_name == item["item_name"]).first()
        if not existing_item:
            db_item = models.RateCard(item_name=item["item_name"], benchmark_price=item["benchmark_price"])
            db.add(db_item)
    
    db.commit()
    db.close()

if __name__ == "__main__":
    seed_db()
