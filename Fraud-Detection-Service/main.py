from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn
import py_eureka_client.eureka_client as eureka_client
import pickle
import os
from datetime import datetime

app = FastAPI(title="Fraud Detection Service")

# Setup Eureka Client
EUREKA_SERVER = os.getenv("EUREKA_SERVER", "http://eureka-server:8761/eureka")
SERVICE_PORT = int(os.getenv("PORT", 7508))

class TransactionRequest(BaseModel):
    senderId: str
    receiverId: str
    amount: float
    type: str
    senderOldBalance: Optional[float] = 0.0
    receiverOldBalance: Optional[float] = 0.0
    timestamp: Optional[str] = None

class FraudResponse(BaseModel):
    isFraud: bool
    riskScore: float
    message: str

# Load ML Model (placeholder logic to load user's models)
model = None
features = None

def load_models():
    global model, features
    try:
        if os.path.exists('models/fraud_model.pkl') and os.path.exists('models/model_feature.pkl'):
            with open('models/fraud_model.pkl', 'rb') as f:
                model = pickle.load(f)
            with open('models/model_feature.pkl', 'rb') as f:
                features = pickle.load(f)
            print("Models loaded successfully")
        else:
            print("Models not found. Using rule-based fallback.")
    except Exception as e:
        print(f"Error loading models: {e}")

@app.on_event("startup")
async def startup_event():
    load_models()
    await eureka_client.init_async(
        eureka_server=EUREKA_SERVER,
        app_name="FRAUD-DETECTION-SERVICE",
        instance_port=SERVICE_PORT
    )

@app.post("/api/fraud/evaluate", response_model=FraudResponse)
async def evaluate_transaction(request: TransactionRequest):
    # If the user model is loaded, we can use it
    if model is not None and features is not None:
        try:
            # Data preprocessing based on user's feature requirement
            import pandas as pd
            import numpy as np
            
            # Predict new balances (simplified approach since we don't have them pre-calculated)
            sender_new_balance = request.senderOldBalance - request.amount
            receiver_new_balance = request.receiverOldBalance + request.amount
            
            # Build data dict corresponding to PaySim base features
            data_dict = {
                'step': 1,
                'amount': request.amount,
                'oldbalanceOrg': request.senderOldBalance,
                'newbalanceOrig': sender_new_balance,
                'oldbalanceDest': request.receiverOldBalance,
                'newbalanceDest': receiver_new_balance,
                'type_CASH_IN': 1 if request.type == 'CASH_IN' else 0,
                'type_CASH_OUT': 1 if request.type == 'CASH_OUT' else 0,
                'type_DEBIT': 1 if request.type == 'DEBIT' else 0,
                'type_PAYMENT': 1 if request.type == 'PAYMENT' else 0,
                'type_TRANSFER': 1 if request.type == 'TRANSFER' else 0,
            }
            
            # Create a dataframe and ensure it matches the exact feature columns the model expects
            df = pd.DataFrame([data_dict])
            
            # Reindex to match the exact feature list saved in model_feature.pkl
            # Fill any missing columns with 0
            df_final = df.reindex(columns=features, fill_value=0)
            
            # Predict
            pred = model.predict(df_final)
            risk_proba = 0.0
            if hasattr(model, "predict_proba"):
                risk_proba = model.predict_proba(df_final)[0][1]
            else:
                risk_proba = float(pred[0])
                
            is_fraud = bool(pred[0] == 1)
            message = "Transaction flagged by ML model as Fraud" if is_fraud else "Transaction appears normal (ML model)"
            
            return FraudResponse(
                isFraud=is_fraud,
                riskScore=risk_proba,
                message=message
            )
        except Exception as e:
            print(f"Prediction error: {e}")
            
    # Rule based fallback
    is_fraud = False
    risk_score = 0.0
    message = "Transaction appears normal"

    # Simple logic
    if request.amount > 10000:
        is_fraud = True
        risk_score = 0.85
        message = "High value transaction"
    
    return FraudResponse(
        isFraud=is_fraud,
        riskScore=risk_score,
        message=message
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=SERVICE_PORT)
