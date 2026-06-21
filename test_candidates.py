import requests
base_url = "http://127.0.0.1:8000/api/v1"
login_data = {"email": "test@example.com", "password": "password123"}
response = requests.post(f"{base_url}/auth/login", json=login_data)
token = response.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}
resp = requests.get(f"{base_url}/candidates", headers=headers)
print(resp.status_code)
print(resp.text)
