from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship as db_relationship
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # UUID or Google ID
    email = Column(String, unique=True, index=True)
    name = Column(String)
    image = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    personas = db_relationship("Persona", back_populates="user", cascade="all, delete-orphan")
    profile = db_relationship("UserProfile", uselist=False, back_populates="user", cascade="all, delete-orphan")

class Persona(Base):
    __tablename__ = "personas"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    name = Column(String, index=True)
    relationship = Column(String)
    appearance = Column(Text)
    personality = Column(Text)
    habits = Column(Text)
    speech_style = Column(Text)
    memories = Column(Text)
    interests = Column(Text)
    tone = Column(String)
    knowledge_document_path = Column(String, nullable=True)
    avatar_image = Column(String, nullable=True)
    avatar_seed = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = db_relationship("User", back_populates="personas")
    conversations = db_relationship("Conversation", back_populates="persona", cascade="all, delete-orphan")
    vector_memories = db_relationship("Memory", back_populates="persona", cascade="all, delete-orphan")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    persona_id = Column(Integer, ForeignKey("personas.id"))
    sender = Column(String) # 'user' or 'ai'
    message = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    persona = db_relationship("Persona", back_populates="conversations")

class Memory(Base):
    __tablename__ = "memories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    persona_id = Column(Integer, ForeignKey("personas.id"))
    memory_text = Column(Text)
    # The actual embedding will be stored in ChromaDB
    # This table is just a relational record of memories 
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    persona = db_relationship("Persona", back_populates="vector_memories")

class UserProfile(Base):
    __tablename__ = "user_profile"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    name = Column(String)
    gender = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    location = Column(String, nullable=True)
    profession = Column(String, nullable=True)
    interests = Column(Text, nullable=True)
    communication_style = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = db_relationship("User", back_populates="profile")
