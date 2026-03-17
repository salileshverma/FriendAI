# Persona AI 🤖✨

**Persona AI** is a premium, full-stack AI platform that allows users to create, management, and interact with deeply personalized AI companions. These companions inhabit unique personalities, remember past interactions, learn from user behavior, and can even process external PDF documents to expand their knowledge.

## 🌟 Key Features

- **Deeply Personalized Personas**: Create characters with specific personality traits, habits, and speech styles.
- **Natural Language & Hinglish**: Supports seamless code-switching between Hindi and English for realistic conversations.
- **Long-term Memory**: Companions "remember" your past discussions, life events, and preferences.
- **RAG (Retrieval-Augmented Generation)**: Upload PDFs during persona creation to infuse your companions with specialized knowledge.
- **Emotional Intelligence**: AI detects user moods and reacts with empathy, banter, or professional restraint based on the defined relationship.
- **Dynamic Onboarding**: Smooth profile setup ensures the AI knows who it's talking to.
- **Secure & Robust**: Implementation of connection pooling for database resilience and JWT-based authentication.

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js (Google Provider)
- **Styling**: Tailwind CSS & Framer Motion (for animations)
- **UI Components**: Shadcn UI
- **State Management**: React Hooks & Axios

### Backend
- **Framework**: FastAPI (Python)
- **Database**: Neon (PostgreSQL) with SQLAlchemy ORM
- **Vector Store**: ChromaDB (for long-term memory & RAG)
- **AI Engine**: LangChain & Groq (Llama 3.3 70B Model)
- **Environment**: Python Dotenv

## 🚀 Getting Started

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd ppproject
   ```

2. **Backend Configuration**:
   - Navigate to `backend/`
   - Create a `.env` file based on `.env.example`.
   - Install dependencies: `pip install -r requirements.txt`
   - Start the server: `uvicorn app.main:app --reload`

3. **Frontend Configuration**:
   - Navigate to `frontend/`
   - Create a `.env.local` file with your `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `NEXT_PUBLIC_BACKEND_URL`.
   - Install dependencies: `npm install`
   - Start the dev server: `npm run dev`

## 📦 Deployment Guide

### Frontend (Vercel)
1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Set your environment variables in the Vercel dashboard.
3. Deploy!

### Backend (Render / Fly.io / Railway)
1. Hosted platforms like Render work best for FastAPI.
2. Ensure you have a persistent disk for the `chroma_data` folder if not using a cloud vector store.
3. Configure your `DATABASE_URL` (NeonDB) and `GROQ_API_KEY`.

---
*Created with ❤️ for a more human AI experience.*
