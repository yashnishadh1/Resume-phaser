import requests
try:
    res = requests.post("http://localhost:8000/api/v1/auth/register", json={
        "email": "test_register@test.com",
        "password": "Password@123",
        "full_name": "Test User"
    })
    print(f"Status: {res.status_code}")
    print(f"Body: {res.text}")
except Exception as e:
    print(e)
