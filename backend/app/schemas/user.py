from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserProfileBase(BaseModel):
    name: str
    gender: Optional[str] = None
    age: Optional[int] = None
    location: Optional[str] = None
    profession: Optional[str] = None
    interests: Optional[str] = None
    communication_style: Optional[str] = None

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
