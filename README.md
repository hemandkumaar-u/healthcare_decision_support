# 🏥 MedRisk AI: Clinical Decision Support System

> An intelligent, full-stack predictive healthcare platform designed to augment physician decision-making, providing real-time adverse outcome risk assessments and automated clinical reporting.

---

## 📖 Table of Contents
1. [Project Overview](#project-overview)
2. [Core Features](#core-features)
3. [System Architecture & Tech Stack](#system-architecture--tech-stack)
4. [Deep Learning Engine (XAI)](#deep-learning-engine-xai)
5. [Frontend Dashboard](#frontend-dashboard)
6. [API Reference](#api-reference)
7. [Engineering Challenges & Solutions](#engineering-challenges--solutions)
8. [Installation & Setup](#installation--setup)
9. [Future Roadmap](#future-roadmap)
10. [License](#license)

---

## 🎯 Project Overview

In the fast-paced environment of modern healthcare, physicians are often overwhelmed by the sheer volume of clinical data they must interpret for each patient. **MedRisk AI** was built to solve this problem by providing a Clinical Decision Support System (CDSS) that seamlessly integrates into a physician's workflow. 

By leveraging a highly-optimized Deep Tabular Neural Network trained on massive sets of patient records, this system evaluates real-time vital signs and historical medical data to predict the risk of adverse clinical outcomes. Crucially, the system does not operate as a "black box." It utilizes an **Explainable AI (XAI)** engine to mathematically justify its predictions, ensuring that medical professionals retain full autonomy and understanding over the AI's recommendations.

---

## ✨ Core Features

### 1. AI-Powered Health Risk Assessment
- **Deep Tabular Architecture**: Built from the ground up to process discrete tabular clinical data (as opposed to time-series data).
- **Massive Scale Training**: Trained on a massive dataset of 1,000,000 patient records to ensure robust, generalized prediction capabilities.
- **High Accuracy**: Achieves an impressive ~80% ROC-AUC score on unseen test data, reliably differentiating between low, moderate, high, and critical risk patients.

### 2. Explainable AI (XAI) Engine
- **Clinical Transparency**: Doctors cannot act on blind scores. The XAI engine dynamically calculates the baseline median for any given condition (e.g., Pneumonia, Hypertension).
- **Deviation Analysis**: It compares the patient's current vitals against the calculated baselines and outputs the exact percentage impact each vital sign had on the final risk score.
- **Fallback Mechanisms**: If a rare condition is inputted, the system seamlessly falls back to a generalized population baseline to ensure no prediction fails silently.

### 3. Comprehensive Patient Management
- **Centralized Dashboard**: A modern, sleek React interface to easily manage patients, input vitals, medical history, laboratory values, and view longitudinal measurements.
- **Dynamic File Management**: Supports uploading and parsing complex medical histories.

### 4. Automated Clinical Reporting
- **PDF-Ready HTML Generation**: Automatically compiles the AI's explanation, recorded vitals, patient demographics, and the physician's prescribed medications into a highly formatted, professional medical report.
- **Secure Email Delivery**: Integrates securely with AWS Simple Email Service (SES) via NodeMailer to securely deliver the report to the patient or hospital administration.

### 5. Dynamic Prescription System
- **Point-of-Care Prescriptions**: A seamless UI component allowing physicians to quickly add medications, precise dosages, frequencies, and specific durations.
- **Custom Instructions**: Physicians can add custom text instructions (e.g., "Take with food") which are dynamically mapped directly into the patient's final emailed report.

---

## 🏗️ System Architecture & Tech Stack

MedRisk AI is built using a modern, decoupled microservices architecture, ensuring high scalability and maintainability.

### Frontend Application
- **Framework**: React 18 with Vite for lightning-fast HMR and building.
- **Styling**: TailwindCSS for rapid, responsive, and highly customizable UI design.
- **State Management**: React Hooks (useState, useEffect, useContext).
- **Routing**: React Router DOM for seamless Single Page Application (SPA) navigation.

### Backend Node.js API
- **Framework**: Express.js running on Node.js.
- **Database ORM**: Mongoose.
- **Authentication/Security**: CORS, Dotenv for environment management.
- **Email Service**: NodeMailer configured with AWS SES (Simple Email Service) for high-deliverability clinical emails.
- **PDF Generation**: `html-pdf-node` to convert the dynamic HTML templates into standardized PDFs.

### Deep Learning Microservice
- **Framework**: FastAPI (Python) for asynchronous, high-throughput model serving.
- **Machine Learning**: TensorFlow 2.x & Keras.
- **Data Processing**: Pandas, NumPy, Scikit-Learn.
- **Visualization**: Matplotlib, Seaborn (used during training and metrics generation).

### Database Layer
- **Primary Datastore**: MongoDB (NoSQL) allows for flexible document schemas, easily adapting to varying patient data structures (e.g., varying arrays of lab results or historical measurements).

---

## 🧠 Deep Learning Engine (XAI)

### The Architecture Shift
Initially, the project experimented with Recurrent Neural Networks (GRUs). However, clinical vitals taken at a single point in time are purely tabular, not sequential. 

The architecture was overhauled into a **Deep Tabular Neural Network**:
1. **Input Layer**: Dynamically reshapes tabular data.
2. **Dense Layers**: Stacked `Dense` layers (256 -> 128 -> 64 -> 32) using the `Swish` activation function, which has been shown to outperform `ReLU` in deep networks by preventing dead neurons.
3. **Regularization**: Heavy use of `BatchNormalization` to stabilize learning, accompanied by aggressive `Dropout` layers (0.4 -> 0.3 -> 0.2 -> 0.1) to prevent overfitting on the massive 1M record dataset.
4. **Output**: A final `Sigmoid` activation to output a probability score between 0.0 and 1.0.

### Handling Data Imbalance
Medical datasets are inherently imbalanced (thankfully, adverse outcomes are less common than positive ones). 
- **Previous Approach**: SMOTE (Synthetic Minority Over-sampling Technique) was used. However, applying SMOTE to 1,000,000 records caused severe memory overflow (`Out of Memory` errors).
- **Current Approach**: The engine utilizes Sklearn's `compute_class_weight` to mathematically penalize the model heavily for misclassifying the minority class, allowing the network to train on the entire 1M dataset efficiently without generating synthetic records.

---

## 🚧 Engineering Challenges & Solutions

### 1. Scaling the Deep Learning Pipeline
**The Challenge**: Attempting to load and artificially oversample 1,000,000 patient records in Python caused the application to crash due to RAM exhaustion.
**The Solution**: We completely stripped SMOTE from the pipeline. Instead, we fed the raw imbalanced data directly into the TensorFlow model but passed a calculated `class_weight` dictionary to the `model.fit()` method. This forced the neural network to adjust its gradients proportionally to the rarity of the class, perfectly solving the memory issue while actually improving the ROC-AUC score to ~80%.

### 2. "Black Box" AI Apprehension in Healthcare
**The Challenge**: Doctors are rightfully hesitant to trust a raw "High Risk" AI score without understanding the clinical reasoning behind the algorithm. If an AI says a patient is critical, the doctor needs to know *why*.
**The Solution**: We built a custom **Clinical Explainability Engine** (`dynamic_engine.py`). When a prediction is made, the engine loads historical datasets, calculates the median vitals for patients with that specific condition, and mathematically determines the impact percentage of the current patient's deviated vital signs. The UI then displays a clear explanation: e.g., *"Heart Rate is 25% higher than the baseline for this condition."*

### 3. Incomplete Clinical Email Reporting
**The Challenge**: The XAI baseline breakdowns and the physician's medication instructions were dropping out of the final email payload sent to patients.
**The Solution**: We rewrote the NodeMailer HTML mapping engine (`reportTemplate.js`) from scratch. It now dynamically iterates over the AI's `explanationDetails` array and the React UI's custom medication `instructions`, injecting them directly into the rendered email PDF, guaranteeing patients receive a complete, context-rich clinical summary.

### 4. Model Naming & API Compatibility
**The Challenge**: When we upgraded the architecture from a GRU to a Deep Tabular model, renaming the files broke the FastAPI endpoints and the Node.js proxy server.
**The Solution**: A systematic, full-stack refactoring was executed. We cleanly renamed `gru_model.py` to `tabular_model.py`, updated the `.keras` model artifacts, replaced all internal variable names (e.g., `gru_input` -> `tabular_input`), and synchronized the changes across the UI, Node.js, and FastAPI layers without any downtime in the development environment.

---

## 📡 API Reference

### Deep Learning Service (FastAPI - Port 8000)
- `POST /predict`: Accepts a JSON payload containing patient vitals (Age, HR, BP, SPO2, Temp). Returns the calculated risk level (Low, Medium, High, Critical), a text explanation, and a detailed array of feature impacts.

### Node.js Backend (Express - Port 5000)
- `GET /api/patients`: Retrieves all patients.
- `POST /api/patients`: Creates a new patient record.
- `GET /api/patients/:id`: Retrieves a specific patient's complete medical profile.
- `POST /api/patients/:id/report`: Triggers the report generation. Accepts the patient's data, AI assessment, and medications, generates the PDF, and dispatches the email via AWS SES.

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.9 or higher)
- MongoDB (running locally or a MongoDB Atlas cluster URI)
- AWS Account (for SES email configuration)

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/healthcare-decision-support.git
cd healthcare-decision-support
```

### Step 2: Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthcare_db
AWS_REGION=your-aws-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
EMAIL_FROM="Healthcare AI System" <no-reply@yourdomain.com>
```

### Step 3: Start the Deep Learning Service
This service must be running for predictions to work.
```bash
cd backend/DL_service
# Create a virtual environment (recommended)
python -m venv venv
# Activate the virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run the FastAPI server
python -m uvicorn app:app --port 8000 --reload
```
*The DL API will be available at `http://localhost:8000`.*

### Step 4: Start the Node.js Backend
Open a new terminal window.
```bash
cd backend
npm install
npm start
```
*The Node.js server will run on `http://localhost:5000`.*

### Step 5: Start the React Frontend
Open a third terminal window.
```bash
cd Frontend
npm install
npm run dev
```
*The application will launch on `http://localhost:5173`. Open this URL in your browser.*

---

## 🚀 Future Roadmap

- **LLM Integration**: Integrate large language models (like Gemini) to summarize complex, unstructured medical history notes into structured risk vectors.
- **Real-time IoT Streaming**: Implement WebSocket connections to handle real-time streaming of vital signs directly from hospital bedside monitors.
- **FHIR Compliance**: Refactor the database schema to fully conform to the HL7 FHIR (Fast Healthcare Interoperability Resources) standard for seamless integration with legacy hospital EMRs (Electronic Medical Records).
- **Multi-Modal XAI**: Expand the Explainable AI to visually highlight abnormalities on uploaded patient X-rays or MRI scans.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---
*Built to assist, augment, and empower healthcare professionals.*