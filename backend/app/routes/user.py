from fastapi import APIRouter, Depends, HTTPException, status
import os
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.all_models import UserProfile, User, Persona
from app.schemas.user import UserProfileCreate, UserProfileResponse
from app.middleware.auth import get_current_user
from typing import Optional

router = APIRouter(prefix="/user", tags=["user"])

@router.post("/profile")
def update_user_profile(profile: UserProfileCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    with open('/tmp/backend_debug.log', 'a') as f:
        f.write(f"DEBUG: update_user_profile for user_id: {current_user.id}\n")
    try:
        db_profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
        
        is_new = False
        if db_profile:
            with open('/tmp/backend_debug.log', 'a') as f:
                f.write("DEBUG: Updating existing profile\n")
            update_data = profile.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_profile, key, value)
        else:
            with open('/tmp/backend_debug.log', 'a') as f:
                f.write("DEBUG: Creating new profile\n")
            db_profile = UserProfile(**profile.model_dump(), user_id=current_user.id)
            db.add(db_profile)
            is_new = True
        
        db.commit()
        db.refresh(db_profile)
        
        # Automatic Default Persona Creation for New Profiles
        if is_new:
            existing_persona = db.query(Persona).filter(Persona.user_id == current_user.id).first()
            if not existing_persona:
                default_persona = Persona(
                    user_id=current_user.id,
                    name="AI Companion",
                    relationship="Friendly Assistant",
                    personality="Thoughtful, friendly, supportive, conversational.",
                    speech_style="Natural conversation with short responses.",
                    habits="Encourages meaningful conversations and asks reflective questions.",
                    tone="Warm and calm.",
                    avatar_image="bottts",
                    avatar_seed="Companion"
                )
                db.add(default_persona)
                db.commit()
                with open('/tmp/backend_debug.log', 'a') as f:
                    f.write("DEBUG: Default persona created for new user\n")

        return {"success": True, "message": "Profile saved successfully", "data": db_profile}
        
    except Exception as e:
        db.rollback()
        with open('/tmp/backend_debug.log', 'a') as f:
            f.write(f"DEBUG ERROR: Failed to save profile: {str(e)}\n")
        return {"success": False, "message": f"Profile save failed: {str(e)}"}

@router.get("/profile")
def get_user_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    return {"success": True, "data": db_profile}

