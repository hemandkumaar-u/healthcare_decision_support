import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.utils.class_weight import compute_class_weight
from imblearn.over_sampling import SMOTE
import warnings
warnings.filterwarnings('ignore')

print("1. Loading records from train.csv...")
df = pd.read_csv("train.csv", nrows=500000, on_bad_lines='skip', engine='python')

# Feature Engineering
print("Feature Engineering...")
if 'systolic_bp' in df.columns and 'diastolic_bp' in df.columns:
    df['pulse_pressure'] = df['systolic_bp'] - df['diastolic_bp']
    df['is_hypertensive'] = ((df['systolic_bp'] >= 140) | (df['diastolic_bp'] >= 90)).astype(int)

if 'height' in df.columns and 'weight' in df.columns:
    df['BMI'] = df['weight'] / ((df['height'] / 100) ** 2)

print("2. Preparing features and target...")
y = df['adverse_outcome'].values

leakage_cols = ['adverse_outcome', 'disposition', 'readmission_30d', 'encounter_id', 'patient_id']
columns_to_drop = [col for col in leakage_cols if col in df.columns]
X = df.drop(columns=columns_to_drop)

numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
categorical_cols = X.select_dtypes(include=['object', 'bool']).columns.tolist()

print("3. Handling missing values and encoding data...")
num_imputer = SimpleImputer(strategy='median')
X[numeric_cols] = num_imputer.fit_transform(X[numeric_cols])

if len(categorical_cols) > 0:
    X[categorical_cols] = X[categorical_cols].fillna('Missing')
    X = pd.get_dummies(X, columns=categorical_cols, drop_first=True)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print("4. Splitting data into Training (80%) and Testing (20%)...")
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)

print("Applying SMOTE for class imbalance...")
smote = SMOTE(random_state=42)
X_train_res, y_train_res = smote.fit_resample(X_train, y_train)

class_weights = compute_class_weight('balanced', classes=np.unique(y_train_res), y=y_train_res)
class_weights_dict = dict(enumerate(class_weights))

print("5. Building the Enhanced MLP Model...")
model = tf.keras.Sequential([
    tf.keras.layers.InputLayer(input_shape=(X_train_res.shape[1],)),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.3), 
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.1),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid') 
])

optimizer = tf.keras.optimizers.Adam(learning_rate=0.0005)
model.compile(optimizer=optimizer, loss='binary_crossentropy', metrics=['accuracy'])

print("6. Training the model with Early Stopping...")
early_stopping = tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=15, restore_best_weights=True)

history = model.fit(
    X_train_res, y_train_res,
    validation_split=0.1,
    epochs=150, 
    batch_size=512, 
    class_weight=class_weights_dict,
    callbacks=[early_stopping],
    verbose=1
)

print("\n7. Evaluating the Model on Unseen Test Data...")
y_pred_probs = model.predict(X_test)
y_pred_classes = (y_pred_probs > 0.5).astype(int).flatten()

print("\n--- Classification Report ---")
print(classification_report(y_test, y_pred_classes))

try:
    auc = roc_auc_score(y_test, y_pred_probs)
    print(f"ROC-AUC Score: {auc:.4f}")
except:
    pass

print("\n8. Generating Graphs and Saving...")
# Save the model
model.save("mlp_patient_risk_model.keras")
print("\nModel saved successfully as 'mlp_patient_risk_model.keras'!")