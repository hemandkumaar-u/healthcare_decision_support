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
import warnings
import os

warnings.filterwarnings('ignore')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

print("1. Loading records from train.csv...")
# We use 1,000,000 records for a highly robust dataset
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

# One-hot encode categorical features properly
if len(categorical_cols) > 0:
    X[categorical_cols] = X[categorical_cols].fillna('Missing')
    X = pd.get_dummies(X, columns=categorical_cols, drop_first=True)

# Standardize
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print("4. Splitting data into Training (80%) and Testing (20%)...")
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)

print("Creating a proper validation set from training data...")
# Removing SMOTE entirely to prevent data leakage and overfitting to synthetic noise.
# We will rely purely on well-calibrated class_weights.
X_train_final, X_val, y_train_final, y_val = train_test_split(X_train, y_train, test_size=0.1, random_state=42, stratify=y_train)

# Calculate class weights for the imbalanced dataset
class_weights = compute_class_weight('balanced', classes=np.unique(y_train_final), y=y_train_final)
class_weights_dict = dict(enumerate(class_weights))

print("5. Reshaping data for Tabular model...")
X_train_tabular = np.reshape(X_train_final, (X_train_final.shape[0], 1, X_train_final.shape[1]))
X_val_tabular = np.reshape(X_val, (X_val.shape[0], 1, X_val.shape[1]))
X_test_tabular = np.reshape(X_test, (X_test.shape[0], 1, X_test.shape[1]))

print("6. Building the Deep Tabular Optimized Model...")
model = tf.keras.Sequential([
    tf.keras.layers.InputLayer(input_shape=(1, X_train_final.shape[1])),
    tf.keras.layers.Dense(256, activation='swish'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.4),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(128, activation='swish'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(64, activation='swish'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(32, activation='swish'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.1),
    tf.keras.layers.Dense(1, activation='sigmoid')
])

optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)
model.compile(optimizer=optimizer, loss='binary_crossentropy', metrics=['accuracy', tf.keras.metrics.AUC(name='auc')])

print("7. Training the Tabular model with Early Stopping and LR Reduction...")
early_stopping = tf.keras.callbacks.EarlyStopping(monitor='val_auc', mode='max', patience=8, restore_best_weights=True)
reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(monitor='val_auc', mode='max', factor=0.5, patience=4, min_lr=1e-6)

history = model.fit(
    X_train_tabular, y_train_final,
    validation_data=(X_val_tabular, y_val),
    epochs=100, 
    batch_size=1024, 
    class_weight=class_weights_dict,
    callbacks=[early_stopping, reduce_lr],
    verbose=1
)

print("\n8. Evaluating the Deep Tabular Model on Unseen Test Data...")
y_pred_probs = model.predict(X_test_tabular, verbose=0)
y_pred_classes = (y_pred_probs > 0.5).astype(int).flatten()

print("\n--- Deep Tabular Classification Report ---")
print(classification_report(y_test, y_pred_classes))

try:
    auc = roc_auc_score(y_test, y_pred_probs)
    print(f"ROC-AUC Score: {auc:.4f}")
except:
    pass

print("\n9. Generating Graphs and Saving...")
# Save the model
model.save("tabular_patient_risk_model.keras")

# Generate Confusion Matrix
cm = confusion_matrix(y_test, y_pred_classes)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False)
plt.title('Confusion Matrix - Optimized Tabular Model')
plt.xlabel('Predicted Label')
plt.ylabel('True Label')
plt.tight_layout()
plt.savefig('tabular_confusion_matrix.png')

# Generate Training History Graph
plt.figure(figsize=(12, 5))
plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Train Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.title('Model Accuracy')
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Model Loss')
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.legend()
plt.tight_layout()
plt.savefig('tabular_training_history.png')

print("\nModel saved successfully as 'tabular_patient_risk_model.keras'!")
print("Graphs saved as 'tabular_confusion_matrix.png' and 'tabular_training_history.png'!")