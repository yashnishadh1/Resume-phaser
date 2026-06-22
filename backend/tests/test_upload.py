import io
from fastapi.testclient import TestClient

def test_upload_valid_pdf(client: TestClient, test_user_token: str):
    file_content = b"%PDF-1.4 dummy content"
    files = {"file": ("resume.pdf", io.BytesIO(file_content), "application/pdf")}
    response = client.post("/api/v1/resumes/upload", files=files, headers={"Authorization": f"Bearer {test_user_token}"})
    assert response.status_code in [200, 202, 201]

def test_upload_valid_docx(client: TestClient, test_user_token: str):
    file_content = b"PK\x03\x04 dummy docx content"
    files = {"file": ("resume.docx", io.BytesIO(file_content), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    response = client.post("/api/v1/resumes/upload", files=files, headers={"Authorization": f"Bearer {test_user_token}"})
    assert response.status_code in [200, 202, 201]

def test_upload_invalid_mime_type(client: TestClient, test_user_token: str):
    file_content = b"dummy text content"
    files = {"file": ("resume.txt", io.BytesIO(file_content), "text/plain")}
    response = client.post("/api/v1/resumes/upload", files=files, headers={"Authorization": f"Bearer {test_user_token}"})
    assert response.status_code == 400

def test_upload_invalid_extension(client: TestClient, test_user_token: str):
    file_content = b"%PDF-1.4 dummy content"
    files = {"file": ("resume.exe", io.BytesIO(file_content), "application/pdf")}
    response = client.post("/api/v1/resumes/upload", files=files, headers={"Authorization": f"Bearer {test_user_token}"})
    assert response.status_code == 400

def test_upload_large_file(client: TestClient, test_user_token: str):
    # Simulate a file larger than 5MB
    file_content = b"0" * (6 * 1024 * 1024)
    files = {"file": ("large_resume.pdf", io.BytesIO(file_content), "application/pdf")}
    response = client.post("/api/v1/resumes/upload", files=files, headers={"Authorization": f"Bearer {test_user_token}"})
    assert response.status_code in [200, 413, 400]
