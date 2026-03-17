import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.all_models import Persona, User
from app.middleware.auth import get_current_user
from app.schemas.persona import PersonaResponse, PersonaUpdate
from app.ai.chroma_service import memory_store
from app.utils.text_processor import chunk_text
from typing import List, Optional
import PyPDF2
import io

router = APIRouter(prefix="/persona", tags=["persona"])

@router.post("/create")
async def create_persona(
    name: str = Form(...),
    relationship: str = Form(...),
    appearance: str = Form(...),
    personality: str = Form(...),
    habits: str = Form(...),
    speech_style: str = Form(...),
    memories: str = Form(...),
    interests: str = Form(...),
    tone: str = Form(...),
    avatar_image: Optional[str] = Form(None),
    avatar_seed: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    with open('/tmp/backend_debug.log', 'a') as f:
        f.write(f"DEBUG: create_persona entered for user_id: {current_user.id}, name: {name}\n")
    
    try:
        db_persona = Persona(
            user_id=current_user.id,
            name=name,
            relationship=relationship,
            appearance=appearance,
            personality=personality,
            habits=habits,
            speech_style=speech_style,
            memories=memories,
            interests=interests,
            tone=tone,
            avatar_image=avatar_image,
            avatar_seed=avatar_seed
        )
        
        db.add(db_persona)
        db.commit()
        db.refresh(db_persona)
        
        with open('/tmp/backend_debug.log', 'a') as f:
            f.write(f"DEBUG: Persona created in DB with ID: {db_persona.id}\n")
            
        # Handle PDF Upload if present
        if file and file.filename:
            if not file.filename.lower().endswith(".pdf"):
                return {"success": False, "message": "Only PDF files are allowed"}
                
            upload_dir = "app/uploads/persona_documents"
            os.makedirs(upload_dir, exist_ok=True)
            
            file_path = os.path.join(upload_dir, f"{db_persona.id}_{file.filename}")
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
                
            db_persona.knowledge_document_path = file_path
            db.commit()
            
            # Extract text from PDF
            try:
                pdf_reader = PyPDF2.PdfReader(file_path)
                extracted_text = ""
                for page in pdf_reader.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
                
                if extracted_text:
                    from app.utils.text_processor import chunk_text
                    from app.ai.chroma_service import memory_store
                    chunks = chunk_text(extracted_text)
                    memory_store.add_pdf_knowledge(db_persona.id, chunks)
                    with open('/tmp/backend_debug.log', 'a') as f:
                        f.write(f"DEBUG: PDF knowledge stored for persona {db_persona.id}\n")
            except Exception as pdf_error:
                with open('/tmp/backend_debug.log', 'a') as f:
                    f.write(f"DEBUG ERROR: PDF extraction failed: {str(pdf_error)}\n")

        db.refresh(db_persona)
        
        # Convert to dictionary for reliable serialization
        persona_data = {
            "id": db_persona.id,
            "name": db_persona.name,
            "relationship": db_persona.relationship,
            "appearance": db_persona.appearance,
            "personality": db_persona.personality,
            "habits": db_persona.habits,
            "speech_style": db_persona.speech_style,
            "memories": db_persona.memories,
            "interests": db_persona.interests,
            "tone": db_persona.tone,
            "avatar_image": db_persona.avatar_image,
            "avatar_seed": db_persona.avatar_seed,
            "knowledge_document_path": db_persona.knowledge_document_path,
            "created_at": db_persona.created_at.isoformat() if db_persona.created_at else None
        }

        return {"success": True, "message": "Persona created successfully", "data": persona_data}
                
    except Exception as e:
        db.rollback()
        import traceback
        error_trace = traceback.format_exc()
        with open('/tmp/backend_debug.log', 'a') as f:
            f.write(f"DEBUG ERROR: Failed to create persona: {str(e)}\n{error_trace}\n")
        return {"success": False, "message": f"Failed to create persona: {str(e)}"}

@router.get("/list")
def list_personas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    personas = db.query(Persona).filter(Persona.user_id == current_user.id).offset(skip).limit(limit).all()
    # Serialize manually or rely on schema (but here we wrap it)
    persona_list = []
    for p in personas:
        persona_list.append({
            "id": p.id,
            "name": p.name,
            "relationship": p.relationship,
            "appearance": p.appearance,
            "personality": p.personality,
            "habits": p.habits,
            "speech_style": p.speech_style,
            "memories": p.memories,
            "interests": p.interests,
            "tone": p.tone,
            "avatar_image": p.avatar_image,
            "avatar_seed": p.avatar_seed,
            "knowledge_document_path": p.knowledge_document_path,
            "created_at": p.created_at.isoformat() if p.created_at else None
        })
    return {"success": True, "data": persona_list}

@router.get("/{id}")
def get_persona(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(Persona).filter(Persona.id == id, Persona.user_id == current_user.id).first()
    if not p:
        return {"success": False, "message": "Persona not found"}
    
    persona_data = {
        "id": p.id,
        "name": p.name,
        "relationship": p.relationship,
        "appearance": p.appearance,
        "personality": p.personality,
        "habits": p.habits,
        "speech_style": p.speech_style,
        "memories": p.memories,
        "interests": p.interests,
        "tone": p.tone,
        "avatar_image": p.avatar_image,
        "avatar_seed": p.avatar_seed,
        "knowledge_document_path": p.knowledge_document_path,
        "created_at": p.created_at.isoformat() if p.created_at else None
    }
    return {"success": True, "data": persona_data}

@router.put("/update/{id}")
def update_persona(id: int, persona_update: PersonaUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    persona = db.query(Persona).filter(Persona.id == id, Persona.user_id == current_user.id).first()
    if not persona:
        return {"success": False, "message": "Persona not found"}
    
    try:
        update_data = persona_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(persona, key, value)
            
        db.commit()
        db.refresh(persona)
        return {"success": True, "message": "Persona updated successfully", "data": persona}
    except Exception as e:
        db.rollback()
        return {"success": False, "message": f"Update failed: {str(e)}"}

@router.delete("/delete/{id}")
def delete_persona(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    persona = db.query(Persona).filter(Persona.id == id, Persona.user_id == current_user.id).first()
    if not persona:
        return {"success": False, "message": "Persona not found"}
        
    try:
        db.delete(persona)
        db.commit()
        return {"success": True, "message": "Persona deleted successfully"}
    except Exception as e:
        db.rollback()
        return {"success": False, "message": f"Delete failed: {str(e)}"}
