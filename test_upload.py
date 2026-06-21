import requests
import sys

def test_upload(file_path):
    base_url = "http://127.0.0.1:8000/api/v1"
    
    # 1. Login
    print("Logging in as test@example.com...")
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    response = requests.post(f"{base_url}/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.status_code} - {response.text}")
        return
        
    token = response.json().get("access_token")
    print("Login successful! Got token.")
    
    # 2. Upload file
    print(f"Uploading file: {file_path}...")
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    with open(file_path, "rb") as f:
        files = {"file": (file_path.split("\\")[-1], f, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
        response = requests.post(f"{base_url}/resumes/upload", headers=headers, files=files)
        
    if response.status_code == 200:
        print("Upload SUCCESSFUL!")
        print(response.json())
    else:
        print(f"Upload FAILED: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        test_upload(sys.argv[1])
    else:
        print("Please provide a file path.")
