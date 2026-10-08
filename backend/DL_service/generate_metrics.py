import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix, roc_curve, accuracy_score
import matplotlib.pyplot as plt
import seaborn as sns
import warnings

warnings.filterwarnings('ignore')

print("1. Loading records from train.csv...")
df = pd.read_csv("train.csv", nrows=1000000, on_bad_lines='skip', engine='python')

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

# Identify categorical and continuous columns
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

print("4. Splitting data to get test set (20%)...")
_, X_test, _, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)
print("5. Reshaping data for Tabular model...")
X_test_tabular = np.reshape(X_test, (X_test.shape[0], 1, X_test.shape[1]))

print("6. Loading existing Deep Tabular model...")
try:
    model = tf.keras.models.load_model("tabular_patient_risk_model.keras")
except Exception as e:
    print(f"Error loading model: {e}")
    exit(1)

print("7. Evaluating the Deep Tabular Model on Unseen Test Data...")
y_pred_probs = model.predict(X_test_tabular, verbose=0)
y_pred_classes = (y_pred_probs > 0.5).astype(int).flatten()

acc = accuracy_score(y_test, y_pred_classes)

print("\n--- Deep Tabular Classification Report ---")
print(classification_report(y_test, y_pred_classes))

try:
    auc = roc_auc_score(y_test, y_pred_probs)
    print(f"ROC-AUC Score: {auc:.4f}")
    
    # Generate ROC Curve Graph
    fpr, tpr, thresholds = roc_curve(y_test, y_pred_probs)
    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, color='blue', label=f'ROC Curve (AUC = {auc:.4f})')
    plt.plot([0, 1], [0, 1], color='red', linestyle='--')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC Curve - Deep Tabular Model')
    plt.legend()
    plt.tight_layout()
    plt.savefig('tabular_roc_curve.png')
    print("Graph saved as 'tabular_roc_curve.png'.")
except Exception as e:
    print("Could not calculate AUC or plot ROC:", e)

print("8. Generating Confusion Matrix Graph...")
cm = confusion_matrix(y_test, y_pred_classes)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False)
plt.title('Confusion Matrix - Deep Tabular Model')
plt.xlabel('Predicted Label')
plt.ylabel('True Label')
plt.tight_layout()
plt.savefig('tabular_confusion_matrix.png')
print("Graph saved as 'tabular_confusion_matrix.png'.")

print("9. Generating Accuracy/Metrics Bar Chart...")
plt.figure(figsize=(6, 5))
metrics = ['Accuracy', 'ROC-AUC']
values = [acc, auc] if 'auc' in locals() else [acc, 0]
sns.barplot(x=metrics, y=values, palette='viridis')
for i, v in enumerate(values):
    plt.text(i, v + 0.01, f"{v:.3f}", ha='center', fontweight='bold')
plt.ylim(0, 1.1)
plt.title('Latest Model Performance Metrics')
plt.ylabel('Score')
plt.tight_layout()
plt.savefig('tabular_latest_accuracy.png')
print("Graph saved as 'tabular_latest_accuracy.png'.")
