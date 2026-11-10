import io
import zipfile
from fastapi.testclient import TestClient
from app.core.config import settings


def disable_external_scan_and_parser(monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "UPLOAD_DIR", str(tmp_path))
    monkeypatch.setattr("app.api.resumes.scan_file_for_viruses", lambda _path: True)
    monkeypatch.setattr("app.api.resumes.trigger_parsing", lambda _resume_id: None)


def make_docx():
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        archive.writestr("[Content_Types].xml", "<Types></Types>")
        archive.writestr("word/document.xml", "<document></document>")
    return buffer.getvalue()


def test_upload_valid_pdf(client: TestClient, test_user_token: str, monkeypatch, tmp_path):
    disable_external_scan_and_parser(monkeypatch, tmp_path)
    file_content = b"%PDF-1.4\n1 0 obj<<>>endobj\n%%EOF"
    files = {"file": ("resume.pdf", io.BytesIO(file_content), "application/pdf")}
    response = client.post("/api/v1/resumes/upload", files=files, headers={"Authorization": f"Bearer {test_user_token}"})
    assert response.status_code == 200, response.text
    assert response.json()["filename"] == "resume.pdf"
    assert response.json()["status"] == "pending"


def test_upload_valid_docx(client: TestClient, test_user_token: str, monkeypatch, tmp_path):
    disable_external_scan_and_parser(monkeypatch, tmp_path)
    files = {"file": ("resume.docx", io.BytesIO(make_docx()), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    response = client.post("/api/v1/resumes/upload", files=files, headers={"Authorization": f"Bearer {test_user_token}"})
    assert response.status_code == 200, response.text
    assert response.json()["filename"] == "resume.docx"


def test_upload_rejects_wrong_mime_type(client: TestClient, test_user_token: str):
    files = {"file": ("resume.txt", io.BytesIO(b"plain text"), "text/plain")}
    response = client.post("/api/v1/resumes/upload", files=files, headers={"Authorization": f"Bearer {test_user_token}"})
    assert response.status_code == 400


def test_upload_rejects_invalid_extension(client: TestClient, test_user_token: str):
    files = {"file": ("resume.exe", io.BytesIO(b"%PDF-1.4"), "application/pdf")}
    response = client.post("/api/v1/resumes/upload", files=files, headers={"Authorization": f"Bearer {test_user_token}"})
    assert response.status_code == 400


def test_upload_rejects_file_over_configured_limit(client: TestClient, test_user_token: str, monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "UPLOAD_DIR", str(tmp_path))
    files = {"file": ("large.pdf", io.BytesIO(b"%PDF-1.4" + b"0" * (settings.MAX_UPLOAD_SIZE + 1)), "application/pdf")}
    response = client.post("/api/v1/resumes/upload", files=files, headers={"Authorization": f"Bearer {test_user_token}"})
    assert response.status_code == 413


def test_upload_reports_scanner_unavailable(client: TestClient, test_user_token: str, monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "UPLOAD_DIR", str(tmp_path))
    monkeypatch.setattr("app.api.resumes.scan_file_for_viruses", lambda _path: (_ for _ in ()).throw(RuntimeError("unavailable")))
    files = {"file": ("resume.pdf", io.BytesIO(b"%PDF-1.4"), "application/pdf")}
    response = client.post("/api/v1/resumes/upload", files=files, headers={"Authorization": f"Bearer {test_user_token}"})
    assert response.status_code == 503
    assert response.json()["detail"] == "Resume scanning is unavailable; try again later"
