from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.all_models import Persona, Memory, User
from app.schemas.memory import MemoryCreate, MemoryResponse
from app.ai.chroma_service import memory_store
from app.middleware.auth import get_current_user
from typing import List

router = APIRouter(prefix="/memory", tags=["memory"])

@router.post("/store", response_model=MemoryResponse, status_code=status.HTTP_201_CREATED)
def store_memory(memory: MemoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    persona = db.query(Persona).filter(Persona.id == memory.persona_id, Persona.user_id == current_user.id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")

    # Save memory to db (relational)
    db_memory = Memory(
        user_id=current_user.id,
        persona_id=memory.persona_id,
        memory_text=memory.memory_text
    )
    db.add(db_memory)
    db.commit()
    db.refresh(db_memory)

    # Save embedding to Chroma DB
    memory_store.add_memory(
        persona_id=persona.id,
        memory_text=memory.memory_text,
        memory_id=db_memory.id
    )

    return db_memory

@router.get("/{persona_id}", response_model=List[MemoryResponse])
def get_memories(persona_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify persona belongs to user
    persona = db.query(Persona).filter(Persona.id == persona_id, Persona.user_id == current_user.id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
        
    memories = db.query(Memory).filter(Memory.persona_id == persona_id, Memory.user_id == current_user.id).all()
    return memories
