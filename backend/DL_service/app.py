from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import numpy as np
import tensorflow as tf
from dynamic_engine import model, df_history, feature_cols, get_dynamic_requirements, condition_col
import warnings
import os

warnings.filterwarnings('ignore')

app = FastAPI()

class Patient(BaseModel):
    _id: str = None
    name: str = None
    age: int = None
    vitalSigns: str = None
    # We ignore the rest for the simple prediction

def parse_vitals(vitals_str):
    if not vitals_str:
        return {}
    # Basic parsing if it's JSON or string
    # E.g., vitals might be '{"HR": 80, "BP_SYS": 120}' or 'HR: 80, BP: 120/80'
    import json
    try:
        return json.loads(vitals_str)
    except:
        return {}

def process_and_predict(patient_data, condition_name):
    # Replicate logic from process_patient_encounter
    input_df = pd.DataFrame(columns=feature_cols)
    input_df.loc[0] = 0
    
    # Map patient_data (dict) to input_df
    for key, value in patient_data.items():
        if key in input_df.columns:
            input_df.at[0, key] = value
            
    # Assuming dynamic_engine's numeric_features variable
    # We will compute numeric_features based on our feature_cols
    numeric_features = df_history[feature_cols].select_dtypes(include=['int64', 'float64']).columns.tolist()

    for col in numeric_features:
        input_df[col] = pd.to_numeric(input_df[col], errors='coerce').fillna(0)

    input_array = input_df[numeric_features].values
    expected_features = model.input_shape[-1]
    
    if input_array.shape[1] < expected_features:
        padded_array = np.zeros((1, expected_features))
        padded_array[0, :input_array.shape[1]] = input_array
    else:
        padded_array = input_array[:, :expected_features]

    gru_input = np.reshape(padded_array, (1, 1, expected_features))
    
    raw_probability = model.predict(gru_input, verbose=0)[0][0]
    risk_level = int(np.round(raw_probability * 4))
    
    # Generate explanation string
    explanation_details = []
    condition_data = df_history[df_history[condition_col].astype(str).str.lower() == condition_name.lower()] if condition_col in df_history.columns else pd.DataFrame()
    
    if not condition_data.empty:
        for feature, value in patient_data.items():
            if feature in numeric_features and feature in condition_data.columns:
                historical_median = condition_data[feature].median()
                if pd.notna(historical_median) and historical_median != 0:
                    deviation = abs((value - historical_median) / historical_median)
                    if deviation > 0.10:
                        level = "High" if deviation > 0.3 else ("Moderate" if deviation > 0.15 else "Low")
                        percent = min(100, int(deviation * 150)) # Scale up deviation for UI
                        
                        if risk_level >= 3:
                            percent = min(100, percent + 20)
                            
                        explanation_details.append({
                            "feature": feature.replace('_', ' ').title(),
                            "value": value,
                            "contribution": f"{level} contribution",
                            "percentage": percent,
                            "direction": "HIGHER" if value > historical_median else "LOWER",
                            "normal_median": round(historical_median, 1)
                        })
                        
    explanation_details.sort(key=lambda x: x["percentage"], reverse=True)
    explanation_str = "High risk detected due to significant clinical deviations." if explanation_details and risk_level >= 2 else f"Prediction based on provided data for {condition_name}."
    
    return risk_level, explanation_str, explanation_details

@app.post("/predict")
def predict_risk(patient: dict):
    # Extract vitals and age to form doctor_inputs
    vitals = parse_vitals(patient.get("vitalSigns", ""))
    doctor_inputs = {
        'age': patient.get('age', 0),
        'heart_rate': vitals.get('HR', 0),
        'systolic_bp': vitals.get('BP_SYS', 0),
        'temperature': vitals.get('TEMP', 0),
        'oxygen_saturation': vitals.get('SPO2', 0),
        'respiratory_rate': vitals.get('RR', 0)
    }
    
    # We will use a default condition name 'general' if none is provided
    condition_name = 'general'
    
    risk_num, explanation, explanation_details = process_and_predict(doctor_inputs, condition_name)
    
    # Map 0-4 to Low/Medium/High/Critical
    mapping = {
        0: "Low",
        1: "Low",
        2: "Medium",
        3: "High",
        4: "Critical"
    }
    
    return {
        "riskLevel": mapping.get(risk_num, "Unknown"),
        "explanation": explanation,
        "explanationDetails": explanation_details
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
