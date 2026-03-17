# AI Persona Chat Backend

## Setup Instructions

1. Ensure you have Python 3.10+ installed.
2. Obtain your NeonDB database connection string (ensure it has `?sslmode=require`).
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and fill in your values, especially `GROQ_API_KEY` and `DATABASE_URL`.
5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```
6. The API docs will be available at `http://localhost:8000/docs`.

No manual database migrations are needed for the initial setup. `Base.metadata.create_all` will automatically create the required schemas when the server starts.
