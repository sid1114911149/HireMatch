from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import re
import math

app = FastAPI(
    title="HireMatch ML Service",
    description="Machine Learning service for resume-job matching",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Schemas ────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    resume_text: str
    skills: List[str] = []
    experience_years: float = 0
    education: str = ""
    job_title: str
    job_description: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    experience_min: float = 0

class ResumeScoreRequest(BaseModel):
    resume_text: str
    skills: List[str] = []
    education: List[dict] = []
    experience: List[dict] = []
    projects: List[dict] = []
    certifications: List[str] = []


# ─── TF-IDF Helpers ─────────────────────────────────────────────────────────

def tokenize(text: str) -> List[str]:
    """Simple tokenizer - lowercase, remove punctuation, split words."""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    return [w for w in text.split() if len(w) > 2]


def compute_tfidf(corpus: List[List[str]]) -> List[dict]:
    """Compute TF-IDF vectors for a corpus of tokenized documents."""
    # IDF
    N = len(corpus)
    df = {}
    for doc in corpus:
        for word in set(doc):
            df[word] = df.get(word, 0) + 1

    idf = {w: math.log((N + 1) / (freq + 1)) + 1 for w, freq in df.items()}

    # TF-IDF per doc
    vectors = []
    for doc in corpus:
        if not doc:
            vectors.append({})
            continue
        tf = {}
        for word in doc:
            tf[word] = tf.get(word, 0) + 1
        vec = {w: (c / len(doc)) * idf.get(w, 1) for w, c in tf.items()}
        vectors.append(vec)

    return vectors


def cosine_similarity(vec1: dict, vec2: dict) -> float:
    """Cosine similarity between two sparse TF-IDF vectors."""
    common = set(vec1.keys()) & set(vec2.keys())
    if not common:
        return 0.0
    dot = sum(vec1[w] * vec2[w] for w in common)
    mag1 = math.sqrt(sum(v ** 2 for v in vec1.values()))
    mag2 = math.sqrt(sum(v ** 2 for v in vec2.values()))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot / (mag1 * mag2)


# ─── Matching Logic ─────────────────────────────────────────────────────────

def compute_skill_match(candidate_skills: List[str], required_skills: List[str], preferred_skills: List[str]):
    """Return skill match score and lists of matched/missing skills."""
    candidate_lower = [s.lower() for s in candidate_skills]
    required_lower = [s.lower() for s in required_skills]
    preferred_lower = [s.lower() for s in preferred_skills]

    matched_required = [s for s in required_skills if s.lower() in candidate_lower]
    missing_required = [s for s in required_skills if s.lower() not in candidate_lower]
    matched_preferred = [s for s in preferred_skills if s.lower() in candidate_lower]

    skill_score = (len(matched_required) / max(len(required_skills), 1)) * 100

    return {
        "score": round(skill_score),
        "matchedSkills": matched_required,
        "missingSkills": missing_required,
        "preferredSkillsMatched": matched_preferred
    }


def compute_experience_match(candidate_exp: float, min_exp: float) -> int:
    if min_exp == 0:
        return 100
    if candidate_exp >= min_exp:
        return min(100, round(100 * (candidate_exp / min_exp)))
    ratio = candidate_exp / min_exp
    return max(0, round(ratio * 80))  # penalize slightly


def compute_education_match(education: str) -> int:
    edu_map = {
        "phd": 100, "doctorate": 100,
        "master": 90, "ms": 90, "m.s": 90, "mba": 85,
        "bachelor": 75, "b.s": 75, "b.e": 75, "b.tech": 75,
        "associate": 55,
        "high school": 40, "diploma": 45
    }
    edu_lower = education.lower()
    for key, score in edu_map.items():
        if key in edu_lower:
            return score
    return 60  # default


def get_recommendation_label(score: int) -> str:
    if score >= 85: return "Excellent Match"
    if score >= 70: return "Strong Match"
    if score >= 55: return "Good Match"
    if score >= 40: return "Partial Match"
    return "Weak Match"


def build_skill_gap(missing_skills: List[str], matched_count: int) -> List[dict]:
    gap = []
    for skill in missing_skills[:8]:
        priority = "high" if matched_count < 3 else "medium"
        gap.append({
            "skill": skill,
            "priority": priority,
            "reason": f"{skill} is a required skill for this role",
            "learningDirection": f"Study {skill} through official docs, Coursera, or hands-on projects on GitHub"
        })
    return gap


# ─── Endpoints ──────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "service": "HireMatch ML Service", "version": "1.0.0", "docs": "/docs"}


@app.get("/ml/health")
def health():
    return {"status": "ok", "service": "HireMatch ML Service", "version": "1.0.0"}


@app.post("/ml/analyze")
def analyze(req: AnalyzeRequest):
    """
    Main matching endpoint:
    1. Skill match (TF feature)
    2. Experience match
    3. Education match
    4. Text similarity (TF-IDF cosine)
    5. Weighted overall score
    """
    try:
        # 1. Skill match
        skill_result = compute_skill_match(req.skills, req.required_skills, req.preferred_skills)
        skill_score = skill_result["score"]

        # 2. Experience match
        exp_score = compute_experience_match(req.experience_years, req.experience_min)

        # 3. Education match
        edu_score = compute_education_match(req.education)

        # 4. TF-IDF similarity
        resume_tokens = tokenize(req.resume_text or "")
        jd_tokens = tokenize(req.job_description or "")

        if resume_tokens and jd_tokens:
            vectors = compute_tfidf([resume_tokens, jd_tokens])
            similarity = round(cosine_similarity(vectors[0], vectors[1]) * 100)
        else:
            similarity = 0

        # 5. Weighted overall (weights match PRD)
        overall = round(
            skill_score * 0.40 +
            exp_score * 0.25 +
            edu_score * 0.15 +
            similarity * 0.20
        )
        overall = max(0, min(100, overall))

        skill_gap = build_skill_gap(skill_result["missingSkills"], len(skill_result["matchedSkills"]))

        return {
            "scores": {
                "overall": overall,
                "skills": skill_score,
                "experience": exp_score,
                "education": edu_score,
                "similarity": similarity
            },
            "matchedSkills": skill_result["matchedSkills"],
            "missingSkills": skill_result["missingSkills"],
            "preferredSkillsMatched": skill_result["preferredSkillsMatched"],
            "recommendation": get_recommendation_label(overall),
            "skillGap": skill_gap,
            "mlModelUsed": "tfidf_cosine_weighted"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ml/resume-score")
def resume_score(req: ResumeScoreRequest):
    """Score a resume independently of a job."""
    skill_score = min(len(req.skills) * 6, 100)
    edu_score = 85 if req.education else 50
    exp_score = min(len(req.experience) * 25, 100)
    proj_score = min(len(req.projects) * 20, 100)

    completeness = 0
    if req.skills: completeness += 20
    if req.education: completeness += 20
    if req.experience: completeness += 20
    if req.projects: completeness += 20
    if req.certifications: completeness += 10
    if req.resume_text and len(req.resume_text) > 200: completeness += 10

    overall = round(
        skill_score * 0.30 +
        exp_score * 0.25 +
        proj_score * 0.20 +
        edu_score * 0.15 +
        completeness * 0.10
    )

    suggestions = []
    if len(req.skills) < 5:
        suggestions.append("Add at least 5-8 technical skills to increase visibility")
    if not req.experience:
        suggestions.append("Add work experience or internship entries")
    if not req.projects:
        suggestions.append("Include 2-3 personal or academic projects with tech stack")
    if not req.education:
        suggestions.append("Add your education background")
    if len(req.resume_text) < 300:
        suggestions.append("Expand your resume content with more detail")

    return {
        "score": {
            "overall": overall,
            "skills": skill_score,
            "experience": exp_score,
            "projects": proj_score,
            "education": edu_score,
            "completeness": completeness
        },
        "suggestions": suggestions
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
