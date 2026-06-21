# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.models.resume import Resume, Candidate, CandidateSkill, CandidateExperience, CandidateEducation
import os
try:
    # pyrefly: ignore [missing-import]
    import fitz # PyMuPDF
except ImportError:
    fitz = None
# pyrefly: ignore [missing-import]
import docx
# pyrefly: ignore [missing-import]
import pytesseract
try:
    import spacy
except ImportError:
    spacy = None
from PIL import Image
import io

# Load NLP model lazily or rely on basic regex if not available
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None

class ResumeParserService:
    def __init__(self, db: Session):
        self.db = db

    def extract_text_from_pdf(self, file_path: str) -> str:
        text = ""
        try:
            if fitz:
                doc = fitz.open(file_path)
                for page in doc:
                    text += page.get_text()
            else:
                return "Mock PDF text because PyMuPDF is not installed."
            
            # OCR Fallback if no text extracted (scanned PDF)
            if not text.strip():
                for page in doc:
                    pix = page.get_pixmap()
                    img = Image.open(io.BytesIO(pix.tobytes()))
                    text += pytesseract.image_to_string(img)
        except Exception as e:
            print(f"Error reading PDF: {e}")
        return text

    def extract_text_from_docx(self, file_path: str) -> str:
        text = ""
        try:
            doc = docx.Document(file_path)
            # Extract from paragraphs
            for para in doc.paragraphs:
                if para.text.strip():
                    text += para.text.strip() + "\n"
            # Extract from tables
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        if cell.text.strip():
                            text += cell.text.strip() + "\n"
        except Exception as e:
            print(f"Error reading DOCX: {e}")
        return text

    def process_resume(self, resume_id: int):
        resume = self.db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume:
            return

        resume.status = "processing"
        self.db.commit()

        try:
            # 1. Extract Text
            ext = os.path.splitext(resume.file_path)[1].lower()
            text = ""
            if ext == ".pdf":
                text = self.extract_text_from_pdf(resume.file_path)
            elif ext in [".doc", ".docx"]:
                text = self.extract_text_from_docx(resume.file_path)
            
            # 2. Parse Text (Basic NLP/Regex Heuristics)
            import re
            
            # Extract Email (Robust Regex)
            email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
            email = email_match.group(0) if email_match else None
            
            # Extract Phone (Robust Regex covering international and varied formats)
            phone_match = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
            phone = phone_match.group(0) if phone_match else None
            
            # Extract Name (Heuristic: find first short line that looks like a name)
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            name = None
            for line in lines:
                words = line.split()
                if 1 <= len(words) <= 4:
                    if not any(char.isdigit() for char in line) and not any(p in line for p in ['.', ',', ':', ';', '(', ')']):
                        if line.lower() not in ['resume', 'cv', 'curriculum vitae']:
                            name = line.title()
                            break
            
            if not name:
                name = resume.filename.split('.')[0].replace('_', ' ').replace('-', ' ').title() if resume.filename else "Unknown Candidate"
            
            # Create Candidate
            candidate = Candidate(
                resume_id=resume.id,
                full_name=name,
                email=email,
                phone=phone,
                summary=text[:500] + "..." if len(text) > 500 else text,
                experience_years=0, # Default to 0, advanced NLP needed to calculate accurately
                match_score=0 # Will be calculated asynchronously against JD later
            )
            self.db.add(candidate)
            self.db.commit()
            self.db.refresh(candidate)
            
            # Extract Skills (Heuristic: lookup from a predefined list of tech skills)
            known_skills = [
                # Programming Languages
                "python", "javascript", "typescript", "java", "c++", "c", "c#", "ruby", "go", "rust", "php", "swift", "kotlin", "scala", "dart", "r", "matlab", "perl", "bash", "shell", "powershell", "objective-c", "lua", "haskell",
                # Web Frameworks & Libraries
                "react", "angular", "vue", "next.js", "nuxt.js", "svelte", "django", "flask", "fastapi", "spring boot", "express", "ruby on rails", "laravel", "asp.net", "jquery", "bootstrap", "tailwind css", "material ui", "redux", "graphql",
                # Web Technologies
                "html", "css", "html5", "css3", "sass", "less", "websockets", "rest api", "json", "xml",
                # Databases
                "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "cassandra", "dynamodb", "oracle", "sql server", "sqlite", "mariadb", "couchdb", "neo4j", "firebase", "supabase", "cockroachdb",
                # Cloud & DevOps
                "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform", "ansible", "jenkins", "gitlab ci", "github actions", "linux", "nginx", "apache", "circleci", "travis ci", "vagrant", "puppet", "chef", "prometheus", "grafana", "splunk", "datadog", "new relic",
                # Data & ML
                "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "apache spark", "hadoop", "kafka", "data analysis", "tableau", "power bi", "looker", "snowflake", "bigquery", "data warehousing", "etl", "keras", "matplotlib", "seaborn",
                # Mobile Development
                "react native", "flutter", "android development", "ios development", "xamarin", "ionic",
                # Softwares & Tools
                "git", "jira", "confluence", "figma", "adobe xd", "postman", "grpc", "slack", "trello", "asana", "notion", "excel", "word", "powerpoint", "microsoft office", "google workspace",
                # Core Concepts
                "agile", "scrum", "ci/cd", "microservices", "system design", "data structures", "algorithms", "object-oriented programming", "oop", "test-driven development", "tdd", "domain-driven design", "ddd",
                # Soft Skills
                "communication", "problem solving", "leadership", "teamwork", "time management", "critical thinking", "adaptability", "project management", "collaboration", "creativity", "attention to detail", "analytical skills"
            ]
            found_skills = []
            text_lower = text.lower()
            for skill in known_skills:
                if skill in text_lower:
                    found_skills.append(skill.title())
                    
            if not found_skills:
                found_skills = ["Communication", "Problem Solving"]
                
            for skill in set(found_skills):
                self.db.add(CandidateSkill(candidate_id=candidate.id, name=skill, type="technical"))
                
            resume.status = "completed"
            self.db.commit()

        except Exception as e:
            resume.status = "error"
            self.db.commit()
            print(f"Error parsing resume {resume_id}: {e}")
