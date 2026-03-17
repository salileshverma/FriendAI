from pydantic import BaseModel
from datetime import datetime

class MemoryBase(BaseModel):
    persona_id: int
    memory_text: str

class MemoryCreate(MemoryBase):
    pass

class MemoryResponse(MemoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
