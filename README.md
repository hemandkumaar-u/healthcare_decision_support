# Healthcare Decision Support

## Prerequisites
- Node.js
- Python 3
- MongoDB (running locally or a cluster URI)

## How to Run the Project

This project consists of three main components: a React Frontend, a Node.js Backend, and a Python Deep Learning Service. You will need to run all three services concurrently in separate terminal windows.

### 1. Python Deep Learning Service
This service is responsible for making the patient risk predictions using our optimized inference engine.

1. Navigate to the DL_service directory:
   ```bash
   cd backend/DL_service
   ```
2. Install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the FastAPI server:
  
   ```bash
   C:\Users\meena\AppData\Local\Programs\Python\Python313\python.exe -m uvicorn app:app --port 8000

   ```
   *The DL service will run on `http://localhost:8000`.*

### 2. Node.js Backend Server
This service connects the frontend to the database and the DL service.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the Node.js dependencies:
   ```bash
   npm install
   ```
3. Ensure your `.env` is configured correctly, particularly the MongoDB URI if not running locally.
4. Run the backend server:
   ```bash
   npm start
   ```
   *The backend will run on `http://localhost:5000`.*

### 3. React Frontend
This is the user interface for the application.

1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will be accessible at `http://localhost:5173`.*