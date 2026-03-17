from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ConversationBase(BaseModel):
    persona_id: int
    sender: str
    message: str

class ConversationCreate(ConversationBase):
    pass

class ConversationResponse(ConversationBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    persona_id: int
    message: str
