import httpx
import json

def test_api():
    base_url = "https://resume-phaser.onrender.com/api/v1"
    
    # 1. Register a test user
    email = "testbug@example.com"
    password = "Password123!"
    
    print("Registering user...")
    try:
        r1 = httpx.post(f"{base_url}/auth/register", json={
            "email": email,
            "password": password,
            "full_name": "Test Bug"
        })
        print(r1.status_code, r1.text)
    except Exception as e:
        print("Register failed:", e)
        
    # 2. Login
    print("\nLogging in...")
    r2 = httpx.post(f"{base_url}/auth/login", json={
        "email": email,
        "password": password
    })
    print(r2.status_code, r2.text)
    
    if r2.status_code == 200:
        token = r2.json().get("access_token")
        
        # 3. Get candidates
        print("\nFetching candidates...")
        r3 = httpx.get(f"{base_url}/candidates", headers={
            "Authorization": f"Bearer {token}"
        })
        print(r3.status_code, r3.text)

if __name__ == "__main__":
    test_api()
