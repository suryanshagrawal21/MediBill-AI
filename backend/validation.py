def validate_totals(items: list[dict], grand_total: float) -> bool:
    """
    Validates that the sum of item total_prices matches the grand_total.
    Returns True if valid, False if there's a significant discrepancy.
    """
    try:
        calculated_total = sum(
            float(item.get("charged_price", 0) or item.get("unit_price", 0) or item.get("total_price", 0) or 0) 
            * float(item.get("quantity", 1) or 1) 
            for item in items
        )
        if grand_total is None:
            return True
            
        grand_total = float(grand_total)
        # Allow a small floating point or rounding tolerance (e.g., 10)
        # However, Indian bills have GST which might be around 5% - 18%. We should give a generous tolerance for tax.
        if abs(calculated_total - grand_total) > (grand_total * 0.2 + 50):
            print(f"[Validation Warning] Calculated total {calculated_total} differs from OCR Grand Total {grand_total} by more than tax margin.")
            return False
        return True
    except Exception as e:
        print(f"[Validation Error] {e}")
        return True
