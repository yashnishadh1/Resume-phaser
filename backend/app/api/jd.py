from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api import deps
from app.models.user import User
from app.models.resume import Candidate, CandidateSkill
import math
from collections import Counter

router = APIRouter()

class JDMatchRequest(BaseModel):
    description: str

class JDMatchResponse(BaseModel):
    candidate_id: int
    name: str
    score: int
    matching_skills: list[str]
    missing_skills: list[str]
    recommendations: list[str]

@router.post("/match", response_model=list[JDMatchResponse])
def match_jd(
    request: JDMatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    candidates = db.query(Candidate).all()
    if not candidates:
        return []
        
    jd_text = request.description.lower()
    
    def get_words(text):
        return [w for w in text.replace(',', ' ').replace('.', ' ').split() if len(w) > 2]
        
    jd_words_list = get_words(jd_text)
    jd_words = set(jd_words_list)
    
    results = []
    
    # Pure Python TF-IDF & Cosine Similarity Implementation
    corpus = [jd_words_list]
    candidate_docs = []
    candidate_indices = []
    
    for c in candidates:
        c_skills = [s.name.lower() for s in c.skills]
        c_text = f"{c.summary or ''} {' '.join(c_skills)}".lower()
        c_words = get_words(c_text)
        corpus.append(c_words)
        candidate_docs.append(c_words)
        candidate_indices.append(c)
        
    # Calculate DF (Document Frequency)
    df = Counter()
    for doc in corpus:
        df.update(set(doc))
        
    N = len(corpus)
    
    def compute_tfidf(doc):
        tf = Counter(doc)
        vec = {}
        for word, count in tf.items():
            vec[word] = (count / len(doc)) * math.log(N / (1 + df[word]))
        return vec
        
    def cosine_sim(vec1, vec2):
        intersection = set(vec1.keys()) & set(vec2.keys())
        numerator = sum([vec1[x] * vec2[x] for x in intersection])
        sum1 = sum([vec1[x]**2 for x in vec1.keys()])
        sum2 = sum([vec2[x]**2 for x in vec2.keys()])
        denominator = math.sqrt(sum1) * math.sqrt(sum2)
        if not denominator: return 0.0
        return numerator / denominator
        
    jd_vector = compute_tfidf(jd_words_list)
    
    for i, c_words in enumerate(candidate_docs):
        c = candidate_indices[i]
        c_skills = [s.name.title() for s in c.skills]
        
        c_vector = compute_tfidf(c_words)
        score = cosine_sim(jd_vector, c_vector)
        
        # Determine matching and missing based on naive intersection
        # We assume any skill mentioned in JD is a requirement
        # Let's extract known skills from JD for a cleaner comparison
        known_tech_skills = {"python", "javascript", "react", "fastapi", "sql", "machine learning", "docker", "aws", "typescript", "css", "html", "node.js"}
        jd_inferred_skills = [w.title() for w in jd_words if w in known_tech_skills]
        
        if not jd_inferred_skills:
            jd_inferred_skills = ["Communication", "Problem Solving"]
            
        matching = list(set(jd_inferred_skills).intersection(set(c_skills)))
        missing = list(set(jd_inferred_skills) - set(c_skills))
        
        normalized_score = min(100, int(score * 100 * 2)) # *2 to boost pure python cosine sim which is usually low
        
        results.append({
            "candidate_id": c.id,
            "name": c.full_name,
            "score": normalized_score,
            "matching_skills": matching,
            "missing_skills": missing,
            "recommendations": ["Good fit based on keywords"] if normalized_score > 40 else ["May require training"]
        })
        
    # Sort by score descending
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:10]
