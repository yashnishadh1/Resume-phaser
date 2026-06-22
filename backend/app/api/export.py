# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends
# pyrefly: ignore [missing-import]
from fastapi.responses import StreamingResponse
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api import deps
from app.models.user import User
from app.models.resume import Candidate
import io
import csv
import json

router = APIRouter()

@router.get("/csv")
def export_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    candidates = db.query(Candidate).all()
    
    stream = io.StringIO()
    writer = csv.writer(stream)
    writer.writerow(["ID", "Name", "Email", "Phone", "Location", "Summary"])
    
    for c in candidates:
        writer.writerow([c.id, c.full_name, c.email, c.phone, c.location, c.summary])
        
    stream.seek(0)
    return StreamingResponse(
        iter([stream.getvalue()]), 
        media_type="text/csv", 
        headers={"Content-Disposition": "attachment; filename=candidates.csv"}
    )

@router.get("/json")
def export_json(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    candidates = db.query(Candidate).all()
    data = []
    for c in candidates:
        data.append({
            "id": c.id,
            "name": c.full_name,
            "email": c.email,
            "phone": c.phone,
            "location": c.location
        })
        
    stream = io.StringIO(json.dumps(data))
    return StreamingResponse(
        iter([stream.getvalue()]), 
        media_type="application/json", 
        headers={"Content-Disposition": "attachment; filename=candidates.json"}
    )
