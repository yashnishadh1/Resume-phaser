# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
# pyrefly: ignore [missing-import]
from sqlalchemy.sql import func
from app.db.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    mime_type = Column(String)
    file_size = Column(Integer)
    status = Column(String, default="pending") # pending, processing, completed, error
    uploader_id = Column(Integer, ForeignKey("users.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    uploader = relationship("User", back_populates="resumes")
    candidate = relationship("Candidate", back_populates="resume", uselist=False)

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    
    full_name = Column(String)
    email = Column(String, index=True)
    phone = Column(String)
    location = Column(String)
    
    summary = Column(Text)
    experience_years = Column(Integer, default=0)
    match_score = Column(Float, default=0.0)
    
    applied_role = Column(String, nullable=True)
    status = Column(String, default="Pending")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    resume = relationship("Resume", back_populates="candidate")
    skills = relationship("CandidateSkill", back_populates="candidate", cascade="all, delete-orphan")
    education = relationship("CandidateEducation", back_populates="candidate", cascade="all, delete-orphan")
    experience = relationship("CandidateExperience", back_populates="candidate", cascade="all, delete-orphan")

class CandidateSkill(Base):
    __tablename__ = "candidate_skills"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    name = Column(String, index=True)
    type = Column(String) # technical, soft
    
    candidate = relationship("Candidate", back_populates="skills")

class CandidateEducation(Base):
    __tablename__ = "candidate_education"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    degree = Column(String)
    institution = Column(String)
    year = Column(String)
    cgpa = Column(String)
    
    candidate = relationship("Candidate", back_populates="education")

class CandidateExperience(Base):
    __tablename__ = "candidate_experience"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    company = Column(String)
    position = Column(String)
    duration = Column(String)
    description = Column(Text)
    
    candidate = relationship("Candidate", back_populates="experience")

class JobDescription(Base):
    __tablename__ = "job_descriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    required_skills = Column(JSON)
    created_by = Column(Integer, ForeignKey("users.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class JDMatch(Base):
    __tablename__ = "jd_matches"
    
    id = Column(Integer, primary_key=True, index=True)
    jd_id = Column(Integer, ForeignKey("job_descriptions.id"))
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    score = Column(Float)
    matching_skills = Column(JSON)
    missing_skills = Column(JSON)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
