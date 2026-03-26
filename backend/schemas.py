from pydantic import BaseModel
from typing import List, Optional
import datetime

class ItemBase(BaseModel):
    name: str
    price: float
    quantity: int

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int
    bill_id: int

    class Config:
        from_attributes = True

class BillBase(BaseModel):
    filename: str

class BillCreate(BillBase):
    items: List[ItemCreate]

class Bill(BillBase):
    id: int
    upload_date: datetime.datetime
    items: List[Item]

    class Config:
        from_attributes = True

class RateCardBase(BaseModel):
    item_name: str
    benchmark_price: float

class RateCard(RateCardBase):
    id: int

    class Config:
        from_attributes = True

class AnalysisResult(BaseModel):
    item_name: str
    charged_price: float
    benchmark_price: float
    difference: float
    is_overcharged: bool

class BillAnalysis(BaseModel):
    items: List[AnalysisResult]
    total_bill: float
    total_overcharge: float
    percent_overcharge: float
