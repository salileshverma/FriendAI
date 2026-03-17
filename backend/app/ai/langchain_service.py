from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from app.models.all_models import Persona
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

class ChatService:
    def __init__(self):
        self.llm = ChatGroq(
            groq_api_key=GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.7,
            top_p=0.9,
            max_tokens=200
        )
        self.prompt_template = PromptTemplate(
            input_variables=[
                "persona_name", 
                "user_name",
                "gender",
                "age",
                "location",
                "profession",
                "interests",
                "relationship",
                "personality", 
                "habits", 
                "speech_style", 
                "tone",
                "retrieved_documents",
                "retrieved_memories",
                "conversation_history", 
                "message"
            ],
            template="""### ROLEPLAY INSTRUCTIONS
You ARE {persona_name}. This is not a simulation; you must inhabit this character completely. 
Your relationship with the user ({user_name}) is: {relationship}. 
This relationship MUST define your boundaries, intimacy level, and how you react to them.

### LINGUISTIC GUIDELINES
1. **Natural Switching**: If the user speaks in "Hinglish" or mixes languages, you should do the same naturally. Don't be a translator; be a person who speaks that way.
2. **Conversation Flow**: Use short, punchy sentences. Real people don't write essays in chat.
3. **No Robot Talk**: Never say "As an AI..." or "I am here to help." You are {persona_name}.

### USER PROFILE (The person you are talking to)
- Name: {user_name}
- Gender: {gender} | Age: {age}
- Location: {location} | Profession: {profession}
- Interests: {interests}

### YOUR PERSONA PROFILE ({persona_name})
- Personality: {personality}
- Relationship to User: {relationship}
- Habits: {habits}
- Speech style: {speech_style}
- Tone: {tone}

### YOUR INTERNAL STATE (Context & Memories)
- **Shared History/Learnings**: {retrieved_memories}
- **Deep Knowledge**: {retrieved_documents}

### RECENT CHAT LOG
{conversation_history}

### CURRENT SITUATION
User ({user_name}) said: "{message}"

### RESPONSE RULES
1. **Emotional Resonance**: Detect the user's mood. If they are sad, be empathetic. If they are joking, banter back.
2. **Inhabit, Don't Describe**: Don't tell the user what your personality is. SHOW it through your choice of words.
3. **Internalized Knowledge**: Use your "Internal State" facts as if you just remembered them naturally. Don't say "According to my records..."
4. **Length**: 1-3 sentences normally. Only go longer if the conversation gets deep or storytelling is required.
5. **Relationship Fidelity**: If you are a 'Crush', be slightly flirtatious/shy. If you are a 'Mentor', be encouraging but firm. If you are a 'Friend', be casual.

RESPONSE:"""
        )

    def generate_response(
        self, 
        persona: Persona, 
        user_profile: dict,
        retrieved_docs: list[str],
        past_learnings: list[str],
        chat_history: list[dict], 
        user_input: str
    ) -> str:
        
        # Format chat history
        history_str = ""
        for msg in chat_history:
            sender_name = user_profile.get('name', 'User') if msg["sender"] == "user" else persona.name
            history_str += f"{sender_name}: {msg['message']}\n"
            
        docs_str = "\n".join(retrieved_docs) if retrieved_docs else "None"
        learnings_str = "\n".join(past_learnings) if past_learnings else "None"

        # Prepare prompt variables adhering to the new architecture
        prompt = self.prompt_template.format(
            persona_name=persona.name,
            user_name=user_profile.get('name', 'User'),
            gender=user_profile.get('gender', 'Unknown'),
            age=user_profile.get('age', 'Unknown'),
            location=user_profile.get('location', 'Unknown'),
            profession=user_profile.get('profession', 'Unknown'),
            interests=user_profile.get('interests', 'Unknown'),
            relationship=persona.relationship or "Friend",
            personality=persona.personality,
            habits=persona.habits,
            speech_style=persona.speech_style,
            tone=persona.tone or "Natural",
            retrieved_documents=docs_str,
            retrieved_memories=learnings_str,
            conversation_history=history_str,
            message=user_input
        )

        response = self.llm.invoke(prompt)
        return response.content

    def extract_user_facts(self, conversation_text: str) -> list[str]:
        extraction_prompt = f"""From the conversation below, extract any important facts about the user that should be remembered.
Focus on habits, preferences, life events, or person-specific details.

Conversation:
{conversation_text}

Return short factual statements, one per line. Do not include any other text.
Example:
The user is preparing for a job interview.
The user likes cricket.
"""
        response = self.llm.invoke(extraction_prompt)
        facts = [line.strip("- ").strip() for line in response.content.split("\n") if line.strip()]
        return facts

    def extract_session_learnings(self, conversation_text: str) -> list[str]:
        extraction_prompt = f"""Analyze the conversation below and extract important facts that the persona should remember about the user or shared experiences for future sessions.
Focus on long-term preferences, life events, plans discussed, or significant emotional moments.

Conversation:
{conversation_text}

Return short factual statements, one per line. Do not include any other text.
Example:
The user is planning a trip to Italy in July.
The user and the persona discussed the user's career change.
The user prefers a direct communication style during stress.
"""
        response = self.llm.invoke(extraction_prompt)
        facts = [line.strip("- ").strip() for line in response.content.split("\n") if line.strip()]
        return facts

chat_service = ChatService()
