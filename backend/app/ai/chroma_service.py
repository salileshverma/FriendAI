import os
import chromadb
from chromadb.config import Settings
from dotenv import load_dotenv

load_dotenv()

CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_data")

class MemoryStore:
    def __init__(self):
        # Initialize standard ChromaDB client
        self.client = chromadb.PersistentClient(path=CHROMA_DB_PATH)

    def _get_collection(self, persona_id: int):
        # Create or get collection for a specific persona
        collection_name = f"persona_{persona_id}_memories"
        return self.client.get_or_create_collection(
            name=collection_name
        )

    def add_memory(self, persona_id: int, memory_text: str, memory_id: int):
        collection = self._get_collection(persona_id)
        
        collection.add(
            documents=[memory_text],
            metadatas=[{"persona_id": persona_id, "memory_id": memory_id}],
            ids=[str(memory_id)]
        )

    def retrieve_memories(self, persona_id: int, query: str, top_k: int = 5) -> list[str]:
        collection = self._get_collection(persona_id)
        if collection.count() == 0:
            return []
            
        results = collection.query(
            query_texts=[query],
            n_results=top_k
        )
        
        if results and results['documents'] and results['documents'][0]:
            return results['documents'][0]
        return []

    def add_pdf_knowledge(self, persona_id: int, chunks: list[str]):
        collection = self._get_collection(persona_id)
        
        # We use a different metadata source to distinguish from standard memories
        metadatas = [{"persona_id": persona_id, "source": "pdf_document"} for _ in chunks]
        ids = [f"pdf_{persona_id}_{i}" for i in range(len(chunks))]
        
        collection.add(
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )

    def retrieve_pdf_knowledge(self, persona_id: int, query: str, top_k: int = 5) -> list[str]:
        collection = self._get_collection(persona_id)
        if collection.count() == 0:
            return []
            
        results = collection.query(
            query_texts=[query],
            n_results=top_k,
            where={"source": "pdf_document"}
        )
        
        if results and results['documents'] and results['documents'][0]:
            return results['documents'][0]
        return []

    def add_user_memory(self, persona_id: int, facts: list[str]):
        collection = self._get_collection(persona_id)
        import time
        metadatas = [{"persona_id": persona_id, "source": "user_memory"} for _ in facts]
        ids = [f"user_mem_{persona_id}_{int(time.time())}_{i}" for i in range(len(facts))]
        
        collection.add(
            documents=facts,
            metadatas=metadatas,
            ids=ids
        )

    def retrieve_user_memories(self, persona_id: int, query: str, top_k: int = 5) -> list[str]:
        collection = self._get_collection(persona_id)
        if collection.count() == 0:
            return []
            
        results = collection.query(
            query_texts=[query],
            n_results=top_k,
            where={"source": "user_memory"}
        )
        
        if results and results['documents'] and results['documents'][0]:
            return results['documents'][0]
        return []

    def add_conversation_learning(self, persona_id: int, facts: list[str]):
        collection = self._get_collection(persona_id)
        import time
        
        new_facts = []
        for fact in facts:
            # Simple deduplication: Check for existing similar content
            if collection.count() > 0:
                results = collection.query(
                    query_texts=[fact],
                    n_results=1,
                    where={"source": "conversation_learning"}
                )
                # If similarity is very high (distance is very low), skip
                # ChromaDB distance: lower is more similar. 0.0 is identical.
                if results and results['distances'] and results['distances'][0]:
                    distance = results['distances'][0][0]
                    if distance < 0.15: # Threshold for "near identical"
                        continue
            new_facts.append(fact)

        if not new_facts:
            return

        metadatas = [{"persona_id": persona_id, "source": "conversation_learning"} for _ in new_facts]
        ids = [f"conv_learn_{persona_id}_{int(time.time())}_{i}" for i in range(len(new_facts))]
        
        collection.add(
            documents=new_facts,
            metadatas=metadatas,
            ids=ids
        )

    def retrieve_conversation_learnings(self, persona_id: int, query: str, top_k: int = 5) -> list[str]:
        collection = self._get_collection(persona_id)
        if collection.count() == 0:
            return []
            
        results = collection.query(
            query_texts=[query],
            n_results=top_k,
            where={"source": "conversation_learning"}
        )
        
        if results and results['documents'] and results['documents'][0]:
            return results['documents'][0]
        return []

memory_store = MemoryStore()
