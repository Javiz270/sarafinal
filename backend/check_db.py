import asyncio
import os
from dotenv import load_dotenv
from supabase._async.client import AsyncClient, create_client

load_dotenv("c:/Users/javie/.gemini/antigravity-ide/scratch/sara/backend/.env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

async def main():
    supabase: AsyncClient = await create_client(url, key)
    
    # Let's try to get one loan or just the schema (postgrest doesn't easily expose schema, but we can try to select a row or provoke an error to see columns)
    response = await supabase.table("loans").select("*").limit(1).execute()
    print(response.data)

if __name__ == "__main__":
    asyncio.run(main())
