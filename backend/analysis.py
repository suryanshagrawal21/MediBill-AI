from difflib import get_close_matches
from sqlalchemy.orm import Session
from . import models, schemas

def analyze_bill(bill_items: list[schemas.ItemCreate], db: Session):
    results = []
    total_bill = 0
    total_overcharge = 0
    
    # Get all rate cards
    rate_cards = db.query(models.RateCard).all()
    item_names = [rc.item_name for rc in rate_cards]
    
    for item in bill_items:
        total_bill += item.price * item.quantity
        
        # Fuzzy match item name using stdlib difflib
        matches = get_close_matches(item.name.lower(), [n.lower() for n in item_names], n=1, cutoff=0.6)
        
        if matches:
            match_lower = matches[0]
            rate_card = next((rc for rc in rate_cards if rc.item_name.lower() == match_lower), None)
            benchmark = rate_card.benchmark_price if rate_card else 0.0
            
            # Comparison: if charged_price > 1.15 * benchmark → flag
            is_overcharged = item.price > 1.15 * benchmark
            difference = max(0, item.price - benchmark) * item.quantity if is_overcharged else 0
            
            total_overcharge += difference
            
            results.append(schemas.AnalysisResult(
                item_name=item.name,
                charged_price=item.price,
                benchmark_price=benchmark,
                difference=difference,
                is_overcharged=is_overcharged
            ))
        else:
            # No match found in benchmark data
            results.append(schemas.AnalysisResult(
                item_name=item.name,
                charged_price=item.price,
                benchmark_price=0.0,
                difference=0.0,
                is_overcharged=False
            ))
            
    percent_overcharge = (total_overcharge / total_bill * 100) if total_bill > 0 else 0
    
    return schemas.BillAnalysis(
        items=results,
        total_bill=total_bill,
        total_overcharge=total_overcharge,
        percent_overcharge=percent_overcharge
    )
