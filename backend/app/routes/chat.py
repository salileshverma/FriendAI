from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.all_models import Persona, Conversation, UserProfile, User
from app.schemas.conversation import ChatRequest, ConversationResponse
from app.ai.langchain_service import chat_service
from app.ai.chroma_service import memory_store
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("", response_model=ConversationResponse)
def send_chat_message(request: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    persona = db.query(Persona).filter(Persona.id == request.persona_id, Persona.user_id == current_user.id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")

    # Fetch User Profile
    user_profile_obj = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    user_profile = {
        "name": user_profile_obj.name if user_profile_obj else current_user.name or "User",
        "gender": user_profile_obj.gender if user_profile_obj else "Unknown",
        "age": user_profile_obj.age if user_profile_obj else "Unknown",
        "profession": user_profile_obj.profession if user_profile_obj else "Unknown",
        "location": user_profile_obj.location if user_profile_obj else "Unknown",
        "interests": user_profile_obj.interests if user_profile_obj else "Unknown",
        "communication_style": user_profile_obj.communication_style if user_profile_obj else "Casual"
    }

    # Save user message
    user_conv = Conversation(
        user_id=current_user.id,
        persona_id=persona.id,
        sender="user",
        message=request.message
    )
    db.add(user_conv)
    db.commit()

    # Retrieve 10 most recent chat history for context
    chat_history_query = db.query(Conversation).filter(
        Conversation.persona_id == persona.id
    ).order_by(Conversation.timestamp.desc()).limit(11).all()
    
    # Reverse to get chronological order, skip the just-added user message
    chat_history = list(reversed(chat_history_query[1:]))
    history_dict = [{"sender": msg.sender, "message": msg.message} for msg in chat_history]

    # Retrieve relevant documents from ChromaDB
    persona_memories = memory_store.retrieve_memories(persona.id, request.message, top_k=3)
    pdf_knowledge = memory_store.retrieve_pdf_knowledge(persona.id, request.message, top_k=5)
    user_memories = memory_store.retrieve_user_memories(persona.id, request.message, top_k=5)
    past_learnings = memory_store.retrieve_conversation_learnings(persona.id, request.message, top_k=5)
    
    # Combine knowledge for the prompt
    retrieved_docs = persona_memories + pdf_knowledge + user_memories

    # Generate response
    ai_response_text = chat_service.generate_response(
        persona=persona,
        user_profile=user_profile,
        retrieved_docs=retrieved_docs,
        past_learnings=past_learnings,
        chat_history=history_dict,
        user_input=request.message
    )

    # Save AI response
    ai_conv = Conversation(
        user_id=current_user.id,
        persona_id=persona.id,
        sender="ai",
        message=ai_response_text
    )
    db.add(ai_conv)
    db.commit()
    db.refresh(ai_conv)

    # Background task: Dynamic User Memory Learning
    # Create conversation snippet for extraction
    conv_snippet = f"User: {request.message}\n{persona.name}: {ai_response_text}"
    try:
        new_facts = chat_service.extract_user_facts(conv_snippet)
        if new_facts:
            memory_store.add_user_memory(persona.id, new_facts)
    except Exception as e:
        print(f"Error during fact extraction: {e}")

    return ai_conv

@router.post("/end/{persona_id}")
def end_chat_session(persona_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    persona = db.query(Persona).filter(Persona.id == persona_id, Persona.user_id == current_user.id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")

    # Fetch recent conversation history to extract learnings (last 20 messages)
    history = db.query(Conversation).filter(
        Conversation.persona_id == persona_id
    ).order_by(Conversation.timestamp.desc()).limit(20).all()
    
    if not history:
        return {"message": "No conversation to learn from."}

    # Format history for extraction
    history_text = ""
    for msg in reversed(history):
        sender = "User" if msg.sender == "user" else persona.name
        history_text += f"{sender}: {msg.message}\n"

    try:
        learnings = chat_service.extract_session_learnings(history_text)
        if learnings:
            memory_store.add_conversation_learning(persona_id, learnings)
            return {"message": f"Successfully learned {len(learnings)} new facts.", "learnings": learnings}
        return {"message": "No significant learnings extracted."}
    except Exception as e:
        print(f"Error during session learning extraction: {e}")
        raise HTTPException(status_code=500, detail="Failed to extract learnings.")
