import pytest
import os
from unittest.mock import patch
from app.services.parser import ResumeParserService
from app.models.resume import Resume, Candidate, CandidateSkill

def test_resume_parser_service_pdf_extraction(db_session, mocker):
    parser = ResumeParserService(db_session)
    # Mock PyMuPDF or Tesseract to avoid needing actual files
    mocker.patch.object(parser, 'extract_text_from_pdf', return_value="John Doe\njohn@example.com\n123-456-7890\nPython, React, AWS")
    text = parser.extract_text_from_pdf("dummy.pdf")
    assert "John Doe" in text

def test_process_resume(db_session, mocker):
    # Setup dummy resume in DB
    resume = Resume(
        filename="john_doe.pdf",
        file_path="dummy/path/john_doe.pdf",
        status="pending"
    )
    db_session.add(resume)
    db_session.commit()
    db_session.refresh(resume)

    parser = ResumeParserService(db_session)
    mocker.patch.object(parser, 'extract_text_from_pdf', return_value="John Doe\njohn.doe@gmail.com\n(555) 123-4567\nExperienced software engineer skilled in Python, React, and SQL.")
    
    parser.process_resume(resume.id)
    
    # Assert candidate was created
    candidate = db_session.query(Candidate).filter(Candidate.resume_id == resume.id).first()
    assert candidate is not None
    assert candidate.email == "john.doe@gmail.com"
    # assert phone matched regex
    assert "555" in candidate.phone or "123" in candidate.phone
    
    # Assert skills were extracted
    skills = [s.name for s in db_session.query(CandidateSkill).filter(CandidateSkill.candidate_id == candidate.id).all()]
    assert "Python" in skills
    assert "React" in skills
    assert "Sql" in skills
