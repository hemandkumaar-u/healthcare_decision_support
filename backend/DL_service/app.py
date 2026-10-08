from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import tensorflow as tf
from dynamic_engine import model, condition_stats, feature_cols, numeric_features
import warnings
import os

warnings.filterwarnings('ignore')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
            
    for col in numeric_features:
        input_df[col] = pd.to_numeric(input_df[col], errors='coerce').fillna(0)

    input_array = input_df[numeric_features].values
    expected_features = model.input_shape[-1]
    
    if input_array.shape[1] < expected_features:
        padded_array = np.zeros((1, expected_features))
        padded_array[0, :input_array.shape[1]] = input_array
    else:
        padded_array = input_array[:, :expected_features]

    tabular_input = np.reshape(padded_array, (1, 1, expected_features))
    
    raw_probability = model.predict(tabular_input, verbose=0)[0][0]
    nn_risk_level = int(np.round(raw_probability * 4))
    
    cond = condition_name.lower()
    
    # Pass 1: Calculate a weighted clinical danger score
    danger_score = 0.0
    if cond in condition_stats:
        for feature, value in patient_data.items():
            if pd.notna(value) and value != 0:
                if feature == 'age' and value > 65: danger_score += 0.5
                elif feature == 'heart_rate_bpm' and (value > 100 or value < 60): danger_score += 1.0
                elif feature == 'systolic_bp' and (value > 130 or value < 90): danger_score += 1.0
                elif feature == 'diastolic_bp' and (value > 80 or value < 60): danger_score += 1.0
                elif feature == 'temperature_celsius' and (value > 38.0 or value < 36.0): danger_score += 0.5
                elif feature == 'spo2_pct' and value < 95: danger_score += 2.0
                elif feature == 'respiratory_rate_rpm' and (value > 20 or value < 12): danger_score += 0.5
                
    # Bound the neural network's risk level to prevent minor factors from causing Critical risk
    if danger_score < 1.0:
        risk_level = min(nn_risk_level, 1) # Normal/Low
    elif danger_score < 2.0:
        risk_level = min(nn_risk_level, 2) # Medium
    elif danger_score < 3.0:
        risk_level = min(nn_risk_level, 3) # High
    else:
        risk_level = nn_risk_level # Can be Critical (4)

    # Generate explanation string
    explanation_details = []
    
    if cond in condition_stats:
        medians = condition_stats[cond]['medians']
        for feature, value in patient_data.items():
            if feature in numeric_features and feature in medians:
                historical_median = medians[feature]
                if pd.notna(historical_median) and historical_median != 0 and value != 0:
                    deviation = abs((value - historical_median) / historical_median)
                    
                    # Determine if the deviation is in a dangerous direction based on clinical BASE CONDITIONS
                    is_risk_factor = False
                    clinical_deviation = 0.0
                    
                    if feature == 'age':
                        is_risk_factor = value > 65
                        clinical_deviation = (value - 65) / 65 if is_risk_factor else 0
                    elif feature == 'heart_rate_bpm':
                        is_risk_factor = value > 100 or value < 60
                        clinical_deviation = max(abs(value - 100)/100, abs(value - 60)/60) if is_risk_factor else 0
                    elif feature == 'systolic_bp':
                        is_risk_factor = value > 130 or value < 90
                        clinical_deviation = max(abs(value - 130)/130, abs(value - 90)/90) if is_risk_factor else 0
                    elif feature == 'diastolic_bp':
                        is_risk_factor = value > 80 or value < 60
                        clinical_deviation = max(abs(value - 80)/80, abs(value - 60)/60) if is_risk_factor else 0
                    elif feature == 'temperature_celsius':
                        is_risk_factor = value > 38.0 or value < 36.0
                        clinical_deviation = max(abs(value - 38)/38, abs(value - 36)/36) * 5 
                        if is_risk_factor: clinical_deviation = max(clinical_deviation, 0.1)
                    elif feature == 'spo2_pct':
                        is_risk_factor = value < 95
                        clinical_deviation = abs(value - 95)/95 * 5 if is_risk_factor else 0
                        if is_risk_factor: clinical_deviation = max(clinical_deviation, 0.2)
                    elif feature == 'respiratory_rate_rpm':
                        is_risk_factor = value > 20 or value < 12
                        clinical_deviation = max(abs(value - 20)/20, abs(value - 12)/12) if is_risk_factor else 0
                    else:
                        is_risk_factor = deviation > 0.2
                        clinical_deviation = deviation
                        
                    # Calculate contribution level
                    if is_risk_factor and risk_level >= 2:
                        level = "High" if clinical_deviation > 0.15 else ("Moderate" if clinical_deviation > 0.05 else "Low")
                        if feature == 'spo2_pct':
                            level = "High"
                            
                        percent = min(100, int(clinical_deviation * 300) + 30)
                        if risk_level >= 3:
                            percent = min(100, percent + 20)
                    else:
                        level = "Low"
                        percent = min(30, int(deviation * 40))
                        
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
        'heart_rate_bpm': vitals.get('HR', 0),
        'sbp_mmhg': vitals.get('BP_SYS', 0),
        'dbp_mmhg': vitals.get('BP_DIA', 0),
        'temperature_celsius': vitals.get('TEMP', 0),
        'spo2_pct': vitals.get('SPO2', 0),
        'respiratory_rate_rpm': vitals.get('RR', 0)
    }
    
    condition_name = patient.get('condition')
    if not condition_name:
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
