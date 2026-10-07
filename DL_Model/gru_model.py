import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OrdinalEncoder
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

print("1. Loading records from train.csv...")
df = pd.read_csv("train.csv", nrows=500000, on_bad_lines='skip', engine='python')

print("2. Preparing features and target...")
y = df['adverse_outcome'].values

# Drop future outcome columns to prevent data leakage
leakage_cols = ['adverse_outcome', 'disposition', 'readmission_30d']
columns_to_drop = [col for col in leakage_cols if col in df.columns]
X = df.drop(columns=columns_to_drop)

numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns
categorical_cols = X.select_dtypes(include=['object', 'bool']).columns

print("3. Handling missing values and encoding data...")
num_imputer = SimpleImputer(strategy='median')
X[numeric_cols] = num_imputer.fit_transform(X[numeric_cols])

if len(categorical_cols) > 0:
    cat_imputer = SimpleImputer(strategy='most_frequent')
    X[categorical_cols] = cat_imputer.fit_transform(X[categorical_cols])
    
    encoder = OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1)
    X[categorical_cols] = encoder.fit_transform(X[categorical_cols])

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print("4. Splitting data into Training (80%) and Testing (20%)...")
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

print("5. Reshaping data for GRU (3D Input: Samples, Timesteps, Features)...")
# GRU requires 3D input. We treat the cross-sectional features as a 1-step sequence.
X_train_gru = np.reshape(X_train, (X_train.shape[0], 1, X_train.shape[1]))
X_test_gru = np.reshape(X_test, (X_test.shape[0], 1, X_test.shape[1]))

print("6. Building the GRU (Deep Learning) Model...")
model = tf.keras.Sequential([
    tf.keras.layers.GRU(64, return_sequences=False, input_shape=(1, X_train.shape[1])),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

print("7. Training the GRU model...")
history = model.fit(
    X_train_gru, y_train,
    validation_split=0.1,
    epochs=10, 
    batch_size=512, 
    verbose=1
)

print("\n8. Evaluating the GRU Model on Unseen Test Data...")
y_pred_probs = model.predict(X_test_gru)
y_pred_classes = (y_pred_probs > 0.5).astype(int).flatten()

print("\n--- GRU Classification Report ---")
print(classification_report(y_test, y_pred_classes))

auc = roc_auc_score(y_test, y_pred_probs)
print(f"ROC-AUC Score: {auc:.4f}")

print("\n9. Generating Graphs and Saving...")
# Plot Training History
plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Train Accuracy')
plt.plot(history.history['val_accuracy'], label='Val Accuracy')
plt.title('GRU Accuracy')
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Val Loss')
plt.title('GRU Loss')
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.legend()

plt.tight_layout()
plt.savefig("gru_training_history.png")
plt.show()

# Plot Confusion Matrix
cm = confusion_matrix(y_test, y_pred_classes)
plt.figure(figsize=(6, 5))
sns.heatmap(cm, annot=True, fmt='d', cmap='Greens') # Changed color to easily distinguish from MLP
plt.title('Confusion Matrix (GRU)')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.savefig("gru_confusion_matrix.png")
plt.show()

# Save the model
model.save("gru_patient_risk_model.keras")
print("\nModel saved successfully as 'gru_patient_risk_model.keras'!")