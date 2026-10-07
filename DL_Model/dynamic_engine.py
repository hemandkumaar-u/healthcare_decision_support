import pandas as pd
import numpy as np
import tensorflow as tf
import warnings
import os

# Hide those confusing TensorFlow hardware warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
warnings.filterwarnings('ignore')

print("1. Loading Dynamic Clinical Engine and Historical Data...")
# Load a sample for the dynamic dictionary
df_history = pd.read_csv("train.csv", nrows=50000, on_bad_lines='skip', engine='python')

# We strictly exclude hospital, location, and calendar data so the AI only looks at body metrics
exclude_cols = [
    'adverse_outcome', 'disposition', 'readmission_30d', 
    'arrival_year', 'arrival_month', 'arrival_day', 
    'arrival_hour', 'is_night_shift', 'is_weekend', 
    'covid_period_flag', 'latitude', 'longitude', 
    'annual_ed_volume', 'patient_id', 'encounter_id',
    'hospital_id', 'facility_name', 'zipcode'
]

condition_col = 'chief_complaint' 

if condition_col not in df_history.columns:
    string_cols = df_history.select_dtypes(include=['object']).columns
    if len(string_cols) > 0:
        condition_col = string_cols[0]

feature_cols = [c for c in df_history.columns if c not in exclude_cols and c != condition_col]
numeric_features = df_history[feature_cols].select_dtypes(include=['int64', 'float64']).columns.tolist()

print("2. Loading Trained GRU Model...")
try:
    model = tf.keras.models.load_model("gru_patient_risk_model.keras")
except Exception as e:
    print(f"Error loading model: {e}")
    exit()

def get_dynamic_requirements(condition_name, df, num_requirements=5):
    if condition_col in df.columns:
        condition_data = df[df[condition_col].astype(str).str.lower() == condition_name.lower()]
    else:
        condition_data = pd.DataFrame()

    if condition_data.empty:
        return numeric_features[:5] if len(numeric_features) >= 5 else numeric_features
    
    # Calculate which biological features vary the most for this condition
    feature_importance = condition_data[numeric_features].var().sort_values(ascending=False)
    return feature_importance.head(num_requirements).index.tolist()

def generate_dynamic_explanation(patient_data, condition_name, df, risk_score):
    if condition_col not in df.columns:
        return

    condition_data = df[df[condition_col].astype(str).str.lower() == condition_name.lower()]
    
    if risk_score >= 2 and not condition_data.empty:
        print("\n--- AI EXPLANATION (DATA-DRIVEN) ---")
        print(f"Comparing patient to historical baseline for {condition_name.title()}:")
        
        for feature, value in patient_data.items():
            if feature in numeric_features and feature in condition_data.columns:
                historical_median = condition_data[feature].median()
                if pd.notna(historical_median) and historical_median != 0:
                    deviation = abs((value - historical_median) / historical_median)
                    if deviation > 0.20:
                        direction = "HIGHER" if value > historical_median else "LOWER"
                        print(f" ⚠️ {feature}: {value} (Significantly {direction} than normal median of {historical_median:.1f})")

def process_patient_encounter(doctor_inputs, condition_name, dl_model):
    print(f"\n{'='*60}")
    print(f"INITIATING UNLIMITED SCALE ANALYSIS: {condition_name.upper()}")
    print(f"{'='*60}")
    
    required_params = get_dynamic_requirements(condition_name, df_history)
    missing_params = [p for p in required_params if p not in doctor_inputs]
    
    if missing_params:
        print("\n[WARNING] MISSING CRITICAL PARAMETERS")
        print(f"Based on historical data for {condition_name}, the AI optimally requires:")
        for mp in missing_params:
            print(f" - {mp}")
        print("\nProceeding with available data, but confidence may be reduced...\n")
    
    input_df = pd.DataFrame(columns=feature_cols)
    input_df.loc[0] = 0 
    
    for key, value in doctor_inputs.items():
        if key in input_df.columns:
            input_df.at[0, key] = value

    for col in numeric_features:
        input_df[col] = pd.to_numeric(input_df[col], errors='coerce').fillna(0)

    input_array = input_df[numeric_features].values
    expected_features = dl_model.input_shape[-1]
    
    if input_array.shape[1] < expected_features:
        padded_array = np.zeros((1, expected_features))
        padded_array[0, :input_array.shape[1]] = input_array
    else:
        padded_array = input_array[:, :expected_features]

    gru_input = np.reshape(padded_array, (1, 1, expected_features))
    
    raw_probability = dl_model.predict(gru_input, verbose=0)[0][0]
    risk_level = int(np.round(raw_probability * 4))
    
    print("=== CLINICAL ANALYSIS REPORT ===")
    print(f"Condition: {condition_name.title()}")
    print(f"Adverse Probability: {raw_probability * 100:.1f}%")
    print(f"Calculated Risk Level: {risk_level} / 4")
    
    print("\n--- TRIAGE RECOMMENDATION ---")
    recommendations = {
        0: "Level 0 (Normal): Vitals are within acceptable limits.",
        1: "Level 1 (Mild): Slight deviations detected. Standard monitoring.",
        2: "Level 2 (Moderate): Warning signs present. Recommend closer observation.",
        3: "Level 3 (High): Critical indicators detected. Immediate intervention required.",
        4: "Level 4 (Severe): Imminent risk. Initiate emergency protocols immediately."
    }
    print(recommendations.get(risk_level, "Unknown Status"))
    
    generate_dynamic_explanation(doctor_inputs, condition_name, df_history, risk_level)


if __name__ == "__main__":
    # Test Scenario 1: Sepsis
    patient_a = {
        'age': 68,
        'heart_rate': 125,
        'systolic_bp': 85,
        'temperature': 39.5
    }
    process_patient_encounter(patient_a, 'sepsis', model)
    
    # Test Scenario 2: Heart Attack
    patient_b = {
        'age': 55,
        'heart_rate': 110,
        'systolic_bp': 160
    }
    process_patient_encounter(patient_b, 'heart attack', model)