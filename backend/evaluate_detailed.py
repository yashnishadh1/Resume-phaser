import os
import json
import re
from collections import Counter

from app.services.parser import ResumeParserService
from app.models.resume import Candidate, CandidateSkill, CandidateEducation, CandidateExperience, Resume

class MockDB:
    def __init__(self, filename, filepath):
        self.added = []
        self.filename = filename
        self.filepath = filepath
        
    def add(self, obj):
        self.added.append(obj)
        
    def commit(self):
        pass
        
    def refresh(self, obj):
        obj.id = 1
        
    def query(self, *args, **kwargs):
        return self
        
    def filter(self, *args, **kwargs):
        return self
        
    def first(self):
        r = Resume()
        r.id = 1
        r.filename = self.filename
        r.file_path = self.filepath
        r.status = "pending"
        return r

def normalize(text):
    if not text:
        return ""
    return re.sub(r'[^a-zA-Z0-9]', '', str(text)).lower()

def calc_p_r_f1_acc(tp, fp, fn, total_docs, exact_matches):
    p = tp / (tp + fp) if (tp + fp) > 0 else 0
    r = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * p * r / (p + r) if (p + r) > 0 else 0
    acc = exact_matches / total_docs if total_docs > 0 else 0
    return p, r, f1, acc

def eval_single(truth_val, ext_val):
    t_norm = normalize(truth_val)
    e_norm = normalize(ext_val)
    if t_norm and t_norm == e_norm:
        return 1, 0, 0, 1 # TP, FP, FN, Match
    elif t_norm and not e_norm:
        return 0, 0, 1, 0
    elif not t_norm and e_norm:
        return 0, 1, 0, 0
    elif t_norm and e_norm and t_norm != e_norm:
        return 0, 1, 1, 0
    return 0, 0, 0, 1 # Both empty, count as match

def eval_list(truth_list, ext_list):
    t_set = {normalize(t) for t in truth_list if normalize(t)}
    e_set = {normalize(e) for e in ext_list if normalize(e)}
    
    tp = len(t_set.intersection(e_set))
    fp = len(e_set - t_set)
    fn = len(t_set - e_set)
    
    match = 1 if (t_set == e_set and len(t_set) > 0) else 0
    if len(t_set) == 0 and len(e_set) == 0:
        match = 1
    
    return tp, fp, fn, match

def eval_str_in_list(truth_str, ext_list):
    t_norm = normalize(truth_str)
    e_norms = {normalize(e) for e in ext_list}
    
    if not t_norm:
        if len(e_norms) == 0: return 0, 0, 0, 1
        else: return 0, len(e_norms), 0, 0
        
    matched = False
    for e in e_norms:
        if e in t_norm or t_norm in e:
            matched = True
            break
            
    if matched:
        return 1, len(e_norms)-1, 0, 1
    else:
        return 0, len(e_norms), 1, 0

def main():
    with open("benchmark_dataset/ground_truth.json", "r") as f:
        ground_truth = json.load(f)
        
    resumes_dir = "benchmark_dataset/resumes"
    total_docs = len(ground_truth)
    
    metrics = {
        "name": {"tp":0, "fp":0, "fn":0, "matches":0},
        "email": {"tp":0, "fp":0, "fn":0, "matches":0},
        "phone": {"tp":0, "fp":0, "fn":0, "matches":0},
        "skills": {"tp":0, "fp":0, "fn":0, "matches":0},
        "education": {"tp":0, "fp":0, "fn":0, "matches":0},
        "experience": {"tp":0, "fp":0, "fn":0, "matches":0},
    }
    
    failures = []
    
    docs = {"pdf": {"total": 0, "fail": 0}, "docx": {"total": 0, "fail": 0}}
    ocr_fail = 0
    ocr_total = 0
    
    for filename, truth in ground_truth.items():
        filepath = os.path.join(resumes_dir, filename)
        ext = filename.split('.')[-1].lower()
        if ext in docs:
            docs[ext]["total"] += 1
            
        db = MockDB(filename, filepath)
        parser = ResumeParserService(db)
        
        try:
            parser.process_resume(1)
        except Exception as e:
            if ext in docs: docs[ext]["fail"] += 1
            continue
            
        candidate = next((obj for obj in db.added if isinstance(obj, Candidate)), None)
        skills = [obj.name for obj in db.added if isinstance(obj, CandidateSkill)]
        educations = [obj.degree for obj in db.added if isinstance(obj, CandidateEducation)]
        experiences = [obj.company for obj in db.added if isinstance(obj, CandidateExperience)]
        
        ext_name = candidate.full_name if candidate else ""
        ext_email = candidate.email if candidate else ""
        ext_phone = candidate.phone if candidate else ""
        
        # Check if OCR was used (Candidate summary is "Mock PDF text because PyMuPDF is not installed." or similar)
        # We will approximate OCR failure if name and email are missing for a PDF
        if ext == "pdf":
            ocr_total += 1
            if not ext_name and not ext_email:
                ocr_fail += 1
                
        # Eval Name
        tp, fp, fn, match = eval_single(truth.get("name",""), ext_name)
        metrics["name"]["tp"] += tp; metrics["name"]["fp"] += fp; metrics["name"]["fn"] += fn; metrics["name"]["matches"] += match
        if not match: failures.append(f"Name: extracted '{ext_name}', expected '{truth.get('name')}'")
        
        # Eval Email
        tp, fp, fn, match = eval_single(truth.get("email",""), ext_email)
        metrics["email"]["tp"] += tp; metrics["email"]["fp"] += fp; metrics["email"]["fn"] += fn; metrics["email"]["matches"] += match
        
        # Eval Phone
        tp, fp, fn, match = eval_single(truth.get("phone",""), ext_phone)
        metrics["phone"]["tp"] += tp; metrics["phone"]["fp"] += fp; metrics["phone"]["fn"] += fn; metrics["phone"]["matches"] += match
        
        # Eval Skills
        tp, fp, fn, match = eval_list(truth.get("skills", []), skills)
        metrics["skills"]["tp"] += tp; metrics["skills"]["fp"] += fp; metrics["skills"]["fn"] += fn; metrics["skills"]["matches"] += match
        
        # Eval Education
        tp, fp, fn, match = eval_str_in_list(truth.get("education", ""), educations)
        metrics["education"]["tp"] += tp; metrics["education"]["fp"] += fp; metrics["education"]["fn"] += fn; metrics["education"]["matches"] += match
        if not match: failures.append(f"Education: extracted '{educations}', expected '{truth.get('education')}'")
        
        # Eval Experience
        tp, fp, fn, match = eval_str_in_list(truth.get("experience", ""), experiences)
        metrics["experience"]["tp"] += tp; metrics["experience"]["fp"] += fp; metrics["experience"]["fn"] += fn; metrics["experience"]["matches"] += match
        if not match: failures.append(f"Experience: extracted '{experiences}', expected '{truth.get('experience')}'")
        
        # Document level fail
        if not match and ext in docs:
            docs[ext]["fail"] += 1
             
    output = {
        "metrics": {},
        "failures": failures,
        "docs": docs,
        "ocr": {"total": ocr_total, "fail": ocr_fail}
    }
    
    for k, v in metrics.items():
        p, r, f1, acc = calc_p_r_f1_acc(v["tp"], v["fp"], v["fn"], total_docs, v["matches"])
        output["metrics"][k] = {"precision": p, "recall": r, "f1": f1, "accuracy": acc}
        
    print(json.dumps(output))

if __name__ == "__main__":
    main()
