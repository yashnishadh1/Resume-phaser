import requests
import os
import time

BASE_URL = "http://localhost:8000/api/v1"

def print_step(step_name):
    print(f"\n[{'*'*10}] {step_name} {'*'*10}")

def run_tests():
    session = requests.Session()
    
    # FLOW 1: Auth
    print_step("FLOW 1: Auth")
    email = f"test_{int(time.time())}@example.com"
    password = "Password123!"
    
    # Register
    res = session.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Test User"
    })
    print(f"Register status: {res.status_code}")
    assert res.status_code == 200, res.text
    
    # Login
    res = session.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })
    print(f"Login status: {res.status_code}")
    assert res.status_code == 200, res.text
    token = res.json()["access_token"]
    session.headers.update({"Authorization": f"Bearer {token}"})
    
    # Fetch /me
    res = session.get(f"{BASE_URL}/auth/me")
    print(f"/me status: {res.status_code}")
    assert res.status_code == 200, res.text
    assert res.json()["email"] == email
    
    # FLOW 2: Upload Resume
    print_step("FLOW 2: Upload Resume")
    dummy_pdf_path = "test_resume.pdf"
    with open(dummy_pdf_path, "wb") as f:
        f.write(b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 55\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Python React SQL) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000213 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n316\n%%EOF")
    
    with open(dummy_pdf_path, "rb") as f:
        res = session.post(f"{BASE_URL}/resumes/upload", files={"file": ("test_resume.pdf", f, "application/pdf")})
    
    print(f"Upload status: {res.status_code}")
    assert res.status_code in [200, 201], res.text
    
    # Fetch Candidates
    res = session.get(f"{BASE_URL}/candidates/")
    print(f"Fetch Candidates status: {res.status_code}")
    assert res.status_code == 200, res.text
    candidates = res.json()
    assert len(candidates) > 0
    
    # FLOW 3: JD Match
    print_step("FLOW 3: JD Match")
    res = session.post(f"{BASE_URL}/jd/match", json={
        "description": "Looking for a Python developer with React experience."
    })
    print(f"JD Match status: {res.status_code}")
    assert res.status_code == 200, res.text
    matches = res.json()
    print(f"Matches found: {len(matches)}")
    
    # FLOW 4: Export CSV
    print_step("FLOW 4: Export CSV")
    res = session.get(f"{BASE_URL}/export/csv")
    print(f"Export CSV status: {res.status_code}")
    assert res.status_code == 200, res.text
    assert "text/csv" in res.headers["Content-Type"]
    
    # FLOW 5: Analytics
    print_step("FLOW 5: Analytics")
    res = session.get(f"{BASE_URL}/analytics/dashboard")
    print(f"Analytics status: {res.status_code}")
    assert res.status_code == 200, res.text
    
    print("\n✅ ALL END-TO-END FLOWS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
