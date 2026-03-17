from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PersonaBase(BaseModel):
    name: str
    relationship: Optional[str] = None
    appearance: Optional[str] = None
    personality: Optional[str] = None
    habits: Optional[str] = None
    speech_style: Optional[str] = None
    memories: Optional[str] = None
    interests: Optional[str] = None
    tone: Optional[str] = None
    knowledge_document_path: Optional[str] = None
    avatar_image: Optional[str] = None
    avatar_seed: Optional[str] = None

class PersonaCreate(PersonaBase):
    pass

class PersonaUpdate(BaseModel):
    name: Optional[str] = None
    relationship: Optional[str] = None
    appearance: Optional[str] = None
    personality: Optional[str] = None
    habits: Optional[str] = None
    speech_style: Optional[str] = None
    memories: Optional[str] = None
    interests: Optional[str] = None
    tone: Optional[str] = None
    knowledge_document_path: Optional[str] = None

class PersonaResponse(PersonaBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
