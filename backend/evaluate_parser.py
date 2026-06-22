import os
import json
import re

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

def calculate_metrics(tp, fp, fn):
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    return precision, recall, f1

def normalize(text):
    if not text:
        return ""
    # Strip non-alphanumeric for robust comparison
    return re.sub(r'[^a-zA-Z0-9]', '', str(text)).lower()

def main():
    with open("benchmark_dataset/ground_truth.json", "r") as f:
        ground_truth = json.load(f)
        
    resumes_dir = "benchmark_dataset/resumes"
    
    # Trackers for exact match accuracy
    correct = {"name": 0, "email": 0, "phone": 0, "education": 0, "experience": 0}
    total = len(ground_truth)
    
    # Skill tracking
    skill_tp = 0
    skill_fp = 0
    skill_fn = 0
    
    failure_patterns = []

    for filename, truth in ground_truth.items():
        filepath = os.path.join(resumes_dir, filename)
        
        db = MockDB(filename, filepath)
        parser = ResumeParserService(db)
        
        # Execute parser
        parser.process_resume(1)
        
        # Extract Results
        candidate = next((obj for obj in db.added if isinstance(obj, Candidate)), None)
        skills = [obj.name for obj in db.added if isinstance(obj, CandidateSkill)]
        
        ext_name = candidate.full_name if candidate else ""
        ext_email = candidate.email if candidate else ""
        ext_phone = candidate.phone if candidate else ""
        
        # Evaluate Name
        if normalize(ext_name) == normalize(truth["name"]):
            correct["name"] += 1
        else:
            failure_patterns.append(f"Name Fail in {filename}: Truth='{truth['name']}', Extracted='{ext_name}'")
            
        # Evaluate Email
        if normalize(ext_email) == normalize(truth["email"]):
            correct["email"] += 1
        else:
            failure_patterns.append(f"Email Fail in {filename}: Truth='{truth['email']}', Extracted='{ext_email}'")
            
        # Evaluate Phone
        if normalize(ext_phone) == normalize(truth["phone"]):
            correct["phone"] += 1
        else:
            failure_patterns.append(f"Phone Fail in {filename}: Truth='{truth['phone']}', Extracted='{ext_phone}'")
            
        educations = [obj.degree for obj in db.added if isinstance(obj, CandidateEducation)]
        experiences = [obj.company for obj in db.added if isinstance(obj, CandidateExperience)]

        # Evaluate Education
        truth_edu = truth.get("education", "")
        ext_edu_matched = False
        for ext_edu in educations:
            if normalize(ext_edu) in normalize(truth_edu) or normalize(truth_edu) in normalize(ext_edu):
                correct["education"] += 1
                ext_edu_matched = True
                break
        if not ext_edu_matched:
            failure_patterns.append(f"Education Fail in {filename}: Truth='{truth_edu}', Extracted='{educations}'")

        # Evaluate Experience
        truth_exp = truth.get("experience", "")
        ext_exp_matched = False
        for ext_exp in experiences:
            if normalize(ext_exp) in normalize(truth_exp) or normalize(truth_exp) in normalize(ext_exp):
                correct["experience"] += 1
                ext_exp_matched = True
                break
        if not ext_exp_matched:
            failure_patterns.append(f"Experience Fail in {filename}: Truth='{truth_exp}', Extracted='{experiences}'")

        # Evaluate Skills (Set Intersection)
        truth_skills_norm = {normalize(s) for s in truth["skills"]}
        ext_skills_norm = {normalize(s) for s in skills}
        
        tp = len(truth_skills_norm.intersection(ext_skills_norm))
        fp = len(ext_skills_norm - truth_skills_norm)
        fn = len(truth_skills_norm - ext_skills_norm)
        
        skill_tp += tp
        skill_fp += fp
        skill_fn += fn

    print("--- BENCHMARK RESULTS ---")
    print("ACCURACY (Exact Match):")
    print(f"Name:       {correct['name']/total*100:.2f}%")
    print(f"Email:      {correct['email']/total*100:.2f}%")
    print(f"Phone:      {correct['phone']/total*100:.2f}%")
    print(f"Education:  {correct['education']/total*100:.2f}%")
    print(f"Experience: {correct['experience']/total*100:.2f}%")
    
    p, r, f1 = calculate_metrics(skill_tp, skill_fp, skill_fn)
    print("\nSKILLS EXTRACTION:")
    print(f"Precision: {p*100:.2f}%")
    print(f"Recall:    {r*100:.2f}%")
    print(f"F1 Score:  {f1*100:.2f}%")
    
    with open("benchmark_dataset/failure_patterns.txt", "w") as f:
        f.write("\n".join(failure_patterns))
    print(f"\nWritten {len(failure_patterns)} failure logs to failure_patterns.txt")

if __name__ == "__main__":
    main()
