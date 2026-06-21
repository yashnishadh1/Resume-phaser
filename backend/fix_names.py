import string
from app.db.database import SessionLocal
from app.models.resume import Candidate

db = SessionLocal()
candidates = db.query(Candidate).all()
for candidate in candidates:
    if not candidate.summary: continue
    lines = [line.strip() for line in candidate.summary.split('\n') if line.strip()]
    name = None
    for line in lines:
        words = line.split()
        if 1 <= len(words) <= 4:
            if not any(char.isdigit() for char in line) and not any(p in line for p in ['.', ',', ':', ';', '(', ')']):
                if line.lower() not in ['resume', 'cv', 'curriculum vitae']:
                    name = line.title()
                    break
    if name:
        candidate.full_name = name

db.commit()
db.close()
print("Names updated successfully!")
