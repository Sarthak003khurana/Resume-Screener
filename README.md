# Resume Screener AI 🚀

An AI-powered Resume Screening and Candidate Matching System built using React, Flask, Firebase, Ollama, KeyBERT, and Sentence Transformers.

This project intelligently analyzes uploaded resumes against job descriptions using:
- NLP
- semantic similarity
- transformer embeddings
- AI-based analysis
- skill matching
- recruiter-style recommendations

The system automatically ranks candidates based on technical skills and contextual relevance.

---

# ✨ Features

## 🔐 Authentication
- Firebase Email/Password Authentication
- Google Authentication
- Persistent Login Sessions
- User-specific screening history

---

## 📄 Resume Screening
- Upload multiple resumes
- PDF/DOCX support
- Dynamic job description input
- Real-time candidate analysis

---

## 🧠 AI & NLP Features
- Skill extraction using KeyBERT
- Semantic similarity using Sentence Transformers
- Embedding-based resume matching
- AI-generated recruiter insights using Ollama
- Cosine similarity scoring

---

## 📊 Candidate Analysis
- Overall Match Score
- Skill Score
- Semantic Similarity Score
- Matched Skills
- AI Hiring Recommendations

---

## ☁ Cloud Features
- Firebase Firestore integration
- Persistent screening history
- Cloud-based recruiter data
- Local caching using localStorage

---

# 🏗 Tech Stack

## Frontend
- React
- Vite
- CSS3
- Firebase Authentication
- Firestore Database

---

## Backend
- Flask
- Flask-CORS
- REST APIs

---

## AI / Machine Learning
- Ollama
- KeyBERT
- Sentence Transformers
- NLP
- Embeddings
- Cosine Similarity

---

## Database & Authentication
- Firebase
- Firestore
- Firebase Auth

---

# 📂 Project Structure

```bash
Resume-Screener/
│
├── backend/
│   ├── app.py
│   ├── resume_engine.py
│   ├── vector_store.py
│   ├── requirements.txt
│   └── models/
│
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   │
│   ├── firebase/
│   │   └── config.js
│   │
│   ├── pages/
│   │   ├── AuthPage.jsx
│   │   ├── Dashboard.jsx
│   │   └── PastScreenings.jsx
│   │
│   ├── components/
│   │   ├── UploadPanel.jsx
│   │   ├── ResultsPanel.jsx
│   │   └── IntelligencePanel.jsx
│   │
│   └── styles/
│       ├── auth.css
│       ├── dashboard.css
│       ├── upload.css
│       ├── results.css
│       └── pastscreenings.css
│
├── public/
├── package.json
├── vite.config.js
├── run.bat
└── README.md
```

---

# ⚙ Installation & Setup

# 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/Resume-Screener.git

cd Resume-Screener
```

---

# 2️⃣ Install Frontend Dependencies

```bash
npm install
```

---

# 3️⃣ Create Python Virtual Environment

```bash
python -m venv ResumeSERV
```

Activate environment:

## Windows

```bash
ResumeSERV\Scripts\activate
```

---

# 4️⃣ Install Backend Dependencies

```bash
pip install -r requirements.txt
```

---

# 5️⃣ Install Ollama

Install Ollama from:

https://ollama.com

Then pull the model:

```bash
ollama pull llama3
```

---

# 6️⃣ Configure Firebase

Go to:

https://console.firebase.google.com/

Enable:
- Authentication
- Firestore Database

Create `.env` file:

```env
VITE_FIREBASE_API_KEY=YOUR_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

---

# 🔥 Firestore Rules

Use these Firestore rules:

```js
rules_version = '2';

service cloud.firestore {

  match /databases/{database}/documents {

    match /{document=**} {

      allow read, write: if request.auth != null;
    }
  }
}
```

---

# 🚀 Running the Project

# Start Ollama

```bash
ollama serve
```

---

# Start Backend

```bash
cd backend

python app.py
```

Backend runs on:

```bash
http://127.0.0.1:5000
```

---

# Start Frontend

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# ⚡ Run Everything Automatically

Use:

```bash
run.bat
```

This automatically starts:
- Ollama
- Flask Backend
- React Frontend

---

# 🧠 How The Project Works

## Step 1 — User Authentication
The recruiter logs in using Firebase Authentication.

---

## Step 2 — Resume Upload
The user uploads multiple resumes and enters a job description.

---

## Step 3 — Resume Parsing
The backend extracts text from uploaded resumes using PDF parsing libraries.

---

## Step 4 — Text Cleaning
The extracted text is cleaned and normalized for NLP processing.

---

## Step 5 — Skill Extraction
KeyBERT extracts important technical skills from resumes and job descriptions.

Example:

```text
react
javascript
tailwind
firebase
```

---

## Step 6 — Embedding Generation
Sentence Transformers convert resume text and job descriptions into embeddings (vectors).

Example:

```text
[0.21, 0.88, 0.54, ...]
```

---

## Step 7 — Semantic Similarity
Cosine similarity compares embedding vectors to determine contextual similarity.

Formula:

```text
Cosine Similarity = (A · B) / (||A|| ||B||)
```

---

## Step 8 — Skill Matching
Exact technical skill overlap is calculated between:
- resume skills
- job description skills

---

## Step 9 — AI Analysis
Ollama generates recruiter-style AI recommendations including:
- strengths
- missing skills
- role suitability
- hiring recommendation

---

## Step 10 — Final Ranking
Candidates are ranked based on:
- skill score
- semantic similarity
- AI analysis

---

# 📊 Scoring Logic

```text
Final Score =
(0.9 × Skill Score)
+
(0.1 × Semantic Similarity)
```

Where:
- Skill Score → exact skill overlap
- Semantic Similarity → contextual understanding

---

# 📌 API Endpoint

## Analyze Resumes

```http
POST /analyze
```

### FormData:
- `job_description`
- `resumes[]`

---

# 📄 Sample API Response

```json
[
  {
    "name": "John Doe",
    "score": 9.2,
    "skill_score": 10,
    "semantic_score": 3.1,
    "matched_skills": [
      "react",
      "javascript",
      "tailwind"
    ],
    "ai_analysis": "Strong frontend candidate with relevant React experience."
  }
]
```

---

# 💾 Screening History

The system stores:
- Job Descriptions
- Candidate Results
- AI Analysis
- Timestamps

inside:
- Firebase Firestore
- Browser localStorage

History remains persistent after:
- logout/login
- page refresh
- restarting localhost

---

# 🔒 Security Features

- Firebase Authentication
- Protected Firestore Rules
- User-specific screening history
- Environment variables for API keys

---

# 🚀 Future Improvements

- Resume PDF report generation
- Recruiter analytics dashboard
- Admin panel
- ATS integration
- Cloud deployment
- Docker support
- Advanced AI ranking
- Real-time collaboration

---

# 👨‍💻 Developed By

## Sarthak Khurana , Shivani Jindal

AI-Powered Resume Screening & Matching Platform.