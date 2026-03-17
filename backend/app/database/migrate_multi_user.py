from app.database.connection import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        print("Starting multi-user migration...")
        
        # 1. Create users table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR PRIMARY KEY,
                email VARCHAR UNIQUE,
                name VARCHAR,
                image VARCHAR,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """))
        print("Created users table.")

        # 2. Add user_id to personas
        conn.execute(text("ALTER TABLE personas ADD COLUMN IF NOT EXISTS user_id VARCHAR REFERENCES users(id)"))
        print("Added user_id to personas.")

        # 3. Add user_id to conversations
        conn.execute(text("ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_id VARCHAR REFERENCES users(id)"))
        print("Added user_id to conversations.")

        # 4. Add user_id to memories
        conn.execute(text("ALTER TABLE memories ADD COLUMN IF NOT EXISTS user_id VARCHAR REFERENCES users(id)"))
        print("Added user_id to memories.")

        # 5. Add user_id to user_profile
        conn.execute(text("ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS user_id VARCHAR UNIQUE REFERENCES users(id)"))
        print("Added user_id to user_profile.")
        
        conn.commit()
        print("Migration completed successfully.")

if __name__ == "__main__":
    migrate()
