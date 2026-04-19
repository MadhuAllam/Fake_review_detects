# Fake Review Detection System

This is an AI-powered full-stack application that detects fake reviews. It uses a React frontend, a Node.js backend, and a Python Machine Learning service to run NLP trust scores and bot detection.

## Project Architecture
- **Frontend**: React.js with Vite (`frontend/`)
- **Backend**: Node.js & Express with MongoDB (`backend/`)
- **ML Service**: Python & FastAPI (`ml-service/`)

## Prerequisites
Before you begin, ensure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **Python** (3.9 to 3.11 recommended)
- **MongoDB** (either installed locally or a cloud instance via MongoDB Atlas)

---

## 🚀 How to Run the Project locally

You will need to open **three separate terminals** and run each service concurrently. All commands assume your terminal is starting from the main project folder (`Fake_review_detects-main/Fake_review_detects-main`).

### 1. Start the Machine Learning Service (Terminal 1)
This service handles all the AI analysis. Runs on port `8000`.
```powershell
cd ml-service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Start the Backend API (Terminal 2)
This handles database interactions and frontend communication. Runs on port `5000`.
```powershell
cd backend
npm install
npm run dev
```

### 3. Start the Frontend Application (Terminal 3)
This serves the UI for the application. Runs on port `5173`.
```powershell
cd frontend
npm install
npm run dev
```
Once all three services are running successfully, open your browser and navigate to the frontend URL provided in your third terminal (usually `http://localhost:5173`).

---

## 🛠️ Troubleshooting Common Errors

### ❌ MongoDB Connection Failed (SSL alert number 80)
If the backend crashes with an SSL handshake error (`tlsv1 alert internal error...`), it means MongoDB Atlas is blocking your connection.

**How to fix it:**
1. Log into your MongoDB Atlas account.
2. Go to **Network Access** in the left sidebar.
3. Click **Add IP Address** and select **Allow Access from Anywhere** (or add your specific current IP address).
4. Save, wait 1-2 minutes for Atlas to deploy the changes, and restart the backend.

### Running with a Local Database instead 
If you do not want to use MongoDB Atlas, you can configure the backend to use a local MongoDB instance. In the `backend/.env` file, change your `MONGODB_URI` to:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/fake_review_db
```
*(Make sure your local MongoDB server is running).*
