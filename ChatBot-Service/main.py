from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import py_eureka_client.eureka_client as eureka_client
import os
import requests
import google.generativeai as genai

app = FastAPI(title="ChatBot Service")

EUREKA_SERVER = os.getenv("EUREKA_SERVER", "http://eureka-server:8761/eureka")
SERVICE_PORT = int(os.getenv("PORT", 7509))
API_GATEWAY_URL = os.getenv("API_GATEWAY_URL", "http://api-gateway:7505")

import time

def call_with_retry(func, *args, **kwargs):
    """Retries a request a few times if connection is refused."""
    for i in range(3):
        try:
            return func(*args, **kwargs)
        except requests.exceptions.ConnectionError:
            if i == 2: raise
            time.sleep(2)
    return None

class ChatRequest(BaseModel):
    message: str
    userId: str

class ChatResponse(BaseModel):
    reply: str

# ==========================================
# AGENTIC TOOLS (Function Calling)
# ==========================================

def check_wallet_balance(user_id: str) -> str:
    """Fetches the real-time monetary balance for a user's wallet."""
    try:
        url = f"{API_GATEWAY_URL}/api/wallets/{user_id}"
        response = call_with_retry(requests.get, url, timeout=5)
        if response and response.status_code == 200:
            data = response.json()
            balance = data.get("balance", "unknown")
            currency = data.get("currency", "INR")
            return f"The user has {balance} {currency} in their wallet."
        return f"Failed to retrieve balance. Status: {response.status_code}"
    except Exception as e:
        return f"Service unavailable: {str(e)}"

def check_rewards(user_id: str) -> str:
    """Fetches the user's reward points and their current membership tier (Bronze/Silver/Gold/Platinum)."""
    try:
        url = f"{API_GATEWAY_URL}/api/rewards/points/{user_id}"
        response = call_with_retry(requests.get, url, timeout=5)
        if response and response.status_code == 200:
            data = response.json()
            points = data.get("availablePoints", "unknown")
            tier = data.get("tier", "unknown")
            return f"The user is at {tier} tier and has {points} available points to spend."
        return f"Failed to retrieve rewards. Status: {response.status_code}"
    except Exception as e:
        return f"Service unavailable: {str(e)}"

def file_transaction_complaint(user_id: str, transaction_id: str, reason: str) -> str:
    """Files a complaint or dispute about a specific transaction on behalf of the user. Requires a transaction_id."""
    try:
        url = f"{API_GATEWAY_URL}/api/transaction/disputes"
        payload = {
            "userId": user_id,
            "transactionId": transaction_id,
            "reason": reason
        }
        response = call_with_retry(requests.post, url, json=payload, timeout=5)
        if response and response.status_code in [200, 201]:
            data = response.json()
            dispute_id = data.get("disputeId", "unknown")
            return f"Complaint filed successfully. Dispute ID is {dispute_id}."
        return f"Failed to file complaint. Status: {response.status_code}, Response: {response.text}"
    except Exception as e:
        return f"Service unavailable: {str(e)}"

agent_tools = [check_wallet_balance, check_rewards, file_transaction_complaint]

# ==========================================
# FASTAPI ENDPOINTS
# ==========================================

@app.on_event("startup")
async def startup_event():
    await eureka_client.init_async(
        eureka_server=EUREKA_SERVER,
        app_name="CHATBOT-SERVICE",
        instance_port=SERVICE_PORT
    )

@app.post("/api/chatbot/message", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key or api_key == "your_gemini_key_here":
             return ChatResponse(reply=f"Offline mode. System requires Gemini API Key. Message: {request.message}")
             
        genai.configure(api_key=api_key)
        
        model = genai.GenerativeModel(
            model_name='gemini-2.5-flash',
            tools=agent_tools
        )
        
        # We start a chat session to allow multi-turn tool execution automatically.
        agent_chat = model.start_chat(enable_automatic_function_calling=True)
        
        system_prompt = (
            f"You are a helpful and polite financial assistant for 'Logic Wallet'. "
            f"The user you are currently speaking to has the user ID '{request.userId}'. "
            f"Unless they specify another ID, always use this ID for actions. "
            f"If they ask to file a complaint but don't provide a transaction ID, ask them for it nicely."
            f"User message: {request.message}"
        )
        
        response = agent_chat.send_message(system_prompt)
        reply_msg = response.text
        
    except Exception as e:
        reply_msg = f"Exception: {str(e)}"
        print(f"Gemini error: {e}")

    return ChatResponse(reply=reply_msg)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=SERVICE_PORT)
