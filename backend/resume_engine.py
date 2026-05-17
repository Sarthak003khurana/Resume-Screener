import re
import fitz
import requests

from vector_store import add_documents, search

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from keybert import KeyBERT


# LOAD EMBEDDING MODEL
try:

    model = SentenceTransformer(
        "sentence-transformers/all-MiniLM-L6-v2",
        cache_folder="./models"
    )

    print("Embedding model loaded")

except Exception as e:

    print("Model load error:", e)

    model = None


# KEYBERT MODEL
kw_model = KeyBERT(model=model)


# CLEAN TEXT
def clean_text(text):

    if not text:
        return ""

    text = re.sub(r'<.*?>', ' ', text)
    text = re.sub(r'http\S+', ' ', text)
    text = re.sub(r'[^a-zA-Z ]', ' ', text)
    text = re.sub(r'\s+', ' ', text)

    return text.lower().strip()


# ROLE KEYWORDS (OPTIONAL BOOST)
ROLE_TO_SKILLS = {

    "software engineer": [
        "java", "python", "c++",
        "sql", "git"
    ],

    "data scientist": [
        "python", "machine learning",
        "pandas", "statistics", "sql"
    ],

    "web developer": [
        "html", "css",
        "javascript", "react", "node"
    ]
}


# PDF EXTRACTION USING MUPDF
def extract_pdf_text(file):

    text = ""

    try:

        file_bytes = file.read()

        pdf = fitz.open(
            stream=file_bytes,
            filetype="pdf"
        )

        for page in pdf:

            page_text = page.get_text()

            if page_text:
                text += page_text

    except Exception as e:

        print("PDF ERROR:", e)

    return text


# EXTRACT NAME
def extract_name(text):

    lines = text.split("\n")

    for line in lines[:5]:

        line = line.strip()

        if (
            2 <= len(line.split()) <= 4
            and not any(char.isdigit() for char in line)
        ):

            return line

    return "Unknown Candidate"


# HYBRID AI SKILL EXTRACTION
def extract_skills(text):

    if not text:
        return []

    detected_skills = set()

    # STATIC SKILL DATABASE
    STATIC_SKILLS = {

        # PROGRAMMING
        "python", "java", "c++", "c", "javascript",
        "react", "node", "flask", "django",
        "html", "css", "sql",

        # AI / DATA
        "machine learning", "deep learning",
        "nlp", "pandas", "numpy",
        "data analysis", "statistics",

        # TOOLS
        "aws", "azure", "docker",
        "git", "kubernetes",

        # HR
        "recruitment", "talent acquisition",
        "employee engagement", "payroll",

        # MARKETING
        "seo", "digital marketing",
        "content marketing",
        "social media marketing",

        # FINANCE
        "financial analysis",
        "accounting", "budgeting",

        # BUSINESS
        "communication",
        "leadership",
        "project management",
        "problem solving"
    }

    cleaned_text = text.lower()

    # -----------------------------------
    # STEP 1 → STATIC SKILL MATCHING
    # -----------------------------------
    for skill in STATIC_SKILLS:

        if skill in cleaned_text:
            detected_skills.add(skill)

    # -----------------------------------
    # STEP 2 → KEYBERT EXTRACTION
    # -----------------------------------
    try:

        keywords = kw_model.extract_keywords(

            text,

            keyphrase_ngram_range=(1, 3),

            stop_words="english",

            top_n=25

        )

        raw_keywords = []

        for keyword, score in keywords:

            keyword = keyword.lower().strip()

            if len(keyword) > 2:

                raw_keywords.append(keyword)

    except Exception as e:

        print("KEYBERT ERROR:", e)

        raw_keywords = []

    # -----------------------------------
    # STEP 3 → OLLAMA CLEANING
    # -----------------------------------
    try:

        prompt = f"""
        You are an AI skill extraction system.

        Extract ONLY real professional skills.

        Rules:
        - Return only comma separated skills
        - No explanation
        - No numbering
        - Remove generic words
        - Keep only useful professional skills

        KEYWORDS:
        {", ".join(raw_keywords)}
        """

        response = requests.post(

            "http://localhost:11434/api/generate",

            json={

                "model": "llama3",

                "prompt": prompt,

                "stream": False

            },

            timeout=120
        )

        data = response.json()

        result = data.get("response", "")

        ai_skills = [

            skill.strip().lower()

            for skill in result.split(",")

            if skill.strip()
        ]

        for skill in ai_skills:

            detected_skills.add(skill)

    except Exception as e:

        print("OLLAMA SKILL ERROR:", e)

    return list(detected_skills)


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
def generate_ai_response(
    resume_text,
    job_description,
    detailed=False
):

    # DETAILED REPORT FOR TOP CANDIDATE
    if detailed:

        prompt = f"""
        You are an expert AI recruiter.

        Analyze the candidate professionally.

        Include:
        - strengths
        - missing skills
        - role suitability
        - final hiring recommendation

        Keep response detailed but readable.

        JOB DESCRIPTION:
        {job_description}

        RESUME:
        {resume_text}
        """

    # SHORT REPORT FOR OTHER CANDIDATES
    else:

        prompt = f"""
        You are an AI recruiter.

        Give ONLY 2 short hiring insights.

        Rules:
        - short sentences
        - no headings
        - no numbering
        - no markdown

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
            },

            timeout=120
        )

        data = response.json()

        if "response" in data:
            return data["response"].strip()

        return "No AI response"

    except Exception as e:

        print("OLLAMA ERROR:", e)

        return "AI analysis unavailable."


# MAIN ANALYSIS
def analyze_resumes(job_description, resumes):

    print("Analyzing resumes...")

    cleaned_jd = clean_text(job_description)

    jd_skills = extract_skills(cleaned_jd)

    # OPTIONAL ROLE BOOST
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

        # VECTOR STORE
        try:

            add_documents([cleaned_resume])

        except Exception as e:

            print("FAISS ERROR:", e)

        # EXTRACT SKILLS
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

        # DETAILED REPORT ONLY FOR FIRST CANDIDATE
        detailed_report = len(results) == 0

        # AI ANALYSIS
        ai_response = generate_ai_response(
            cleaned_resume,
            cleaned_jd,
            detailed=detailed_report
        )

        results.append({

            "name": name,

            "score": round(float(final_score), 2),

            "skill_score": round(float(skill_score * 10), 2),

            "semantic_score": round(float(semantic_score * 10), 2),

            "matched_skills": matched_skills[:10],

            "ai_analysis": ai_response

        })

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    print("Results:", results)

    return results