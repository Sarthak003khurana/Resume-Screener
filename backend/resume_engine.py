import re
import fitz
import requests

from vector_store import add_documents, search

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


# Load embedding model safely
try:
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    print("Embedding model loaded")
except Exception as e:
    print("Model load error:", e)
    model = None


# CLEAN TEXT
def clean_text(text):

    if not text:
        return ""

    text = re.sub(r'<.*?>', ' ', text)
    text = re.sub(r'http\S+', ' ', text)
    text = re.sub(r'[^a-zA-Z ]', ' ', text)
    text = re.sub(r'\s+', ' ', text)

    return text.lower().strip()


# SKILLS
SKILLS_LIST = {
    "python","java","c++","javascript","c","sql",
    "machine learning","deep learning","nlp",
    "data analysis","statistics","pandas","numpy",
    "react","node","html","css","django","flask",
    "spring","angular",
    "git","docker","kubernetes","aws","azure"
}


ROLE_TO_SKILLS = {
    "software engineer": ["java","python","c++","sql","git"],
    "data scientist": ["python","machine learning","pandas","statistics","sql"],
    "web developer": ["html","css","javascript","react","node"]
}


# PDF EXTRACTION USING MUPDF
def extract_pdf_text(file):

    text = ""

    try:

        pdf = fitz.open(stream=file.read(), filetype="pdf")

        for page in pdf:
            text += page.get_text()

    except Exception as e:
        print("PDF ERROR:", e)

    return text


# EXTRACT NAME
def extract_name(text):

    lines = text.split("\n")

    for line in lines[:5]:

        line = line.strip()

        if 2 <= len(line.split()) <= 4 and not any(char.isdigit() for char in line):
            return line

    return "Unknown Candidate"


# EXTRACT SKILLS
def extract_skills(text):

    words = set(text.split())

    found_skills = []

    for skill in SKILLS_LIST:

        if " " in skill:

            if skill in text:
                found_skills.append(skill)

        else:

            if skill in words:
                found_skills.append(skill)

    return list(set(found_skills))


# SEMANTIC SIMILARITY
def semantic_similarity(resume_text, jd_text):

    if model is None:
        return 0

    try:

        resume_embedding = model.encode([resume_text])

        jd_embedding = model.encode([jd_text])

        similarity = cosine_similarity(
            resume_embedding,
            jd_embedding
        )[0][0]

        return similarity

    except Exception as e:

        print("Similarity ERROR:", e)

        return 0


# OLLAMA AI ANALYSIS
def generate_ai_response(resume_text, job_description):

    prompt = f"""
    You are an expert AI recruiter.

    Analyze this candidate resume against the job description.

    Return:
    1. Candidate strengths
    2. Missing skills
    3. Suitability for role
    4. Final recommendation

    JOB DESCRIPTION:
    {job_description}

    RESUME:
    {resume_text}
    """

    try:

        response = requests.post(

            "http://localhost:11434/api/generate",

            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            }

        )

        data = response.json()

        return data.get("response", "No AI response")

    except Exception as e:

        print("OLLAMA ERROR:", e)

        return "AI analysis unavailable."


# MAIN ANALYSIS
def analyze_resumes(job_description, resumes):

    print("Analyzing resumes...")

    cleaned_jd = clean_text(job_description)

    jd_skills = extract_skills(cleaned_jd)

    for role, skills in ROLE_TO_SKILLS.items():

        if role in cleaned_jd:
            jd_skills.extend(skills)

    jd_skills = list(set(jd_skills))

    results = []

    for file in resumes:

        print("Processing resume...")

        text = extract_pdf_text(file)

        if not text.strip():
            continue

        name = extract_name(text)

        cleaned_resume = clean_text(text)

        # FAISS VECTOR STORE
        try:
            add_documents([cleaned_resume])
        except Exception as e:
            print("FAISS ERROR:", e)

        # SKILLS
        resume_skills = extract_skills(cleaned_resume)

        matched_skills = list(
            set(jd_skills).intersection(resume_skills)
        )

        # SKILL SCORE
        skill_score = len(matched_skills) / max(len(jd_skills), 1)

        # SEMANTIC SCORE
        semantic_score = semantic_similarity(
            cleaned_resume,
            cleaned_jd
        )

        # FINAL SCORE
        final_score = (
            skill_score * 0.6 +
            semantic_score * 0.4
        ) * 10

        # AI ANALYSIS
        ai_response = generate_ai_response(
            cleaned_resume,
            cleaned_jd
        )

        results.append({

            "name": name,

            "score": round(float(final_score), 2),

            "skill_score": round(float(skill_score * 10), 2),

            "semantic_score": round(float(semantic_score * 10), 2),

            "matched_skills": matched_skills,

            "ai_analysis": ai_response

        })

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    print("Results:", results)

    return results