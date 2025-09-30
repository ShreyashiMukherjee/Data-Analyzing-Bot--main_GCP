from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
from .upload import get_analyzer
from typing import Optional

router = APIRouter()

class ChatRequest(BaseModel):
    session_id: str
    message: str
    api_key: Optional[str] = None

# DEFAULT_GEMINI_API_KEY = "AIzaSyB9bZC8XAPMqsimzbqL4W5Fg5PDbY8-ZwY"
GOOGLE_API_KEY = "AIzaSyBoAFINorYdXTMv2QUeN0tcssC8KL_JXq0"

@router.post("/message")
async def chat_message(request: ChatRequest):
    try:
        analyzer = get_analyzer(request.session_id)
        
        # Prepare data context (first 100 rows)
        data_context = analyzer.df.head(100).to_csv(index=False)
        
        prompt = (
            f"You are a data analysis assistant. The user uploaded the following dataset (CSV format, first 100 rows):\n"
            f"{data_context}\n\n"
            f"User query: {request.message}\n"
            "Please analyze the data and answer the user's question. If a report is requested, generate a concise summary with statistics."
        )
        
        # Use provided API key or default
        api_key = request.api_key or GOOGLE_API_KEY
        
        # Call Gemini API
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        data = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            return {
                "response": result["candidates"][0]["content"]["parts"][0]["text"]
            }
        elif response.status_code == 429:
            return {"error": "Rate limit reached. Please try again later."}
        elif response.status_code == 401:
            return {"error": "Invalid API key."}
        else:
            return {"error": f"API error: {response.status_code}"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))