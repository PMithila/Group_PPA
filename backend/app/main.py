# main.py
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
import shutil, os
import db, models, auth, utils, scheduler
from db import init_db, engine
from typing import List
import pandas as pd

app = FastAPI(title="Advanced Timetable API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB
init_db()

# Simple in-memory user store for demo (switch to DB)
from sqlmodel import Session
def create_user(session: Session, email: str, password: str):
    hashed = auth.hash_password(password)
    u = models.User(email=email, hashed_password=hashed)
    session.add(u); session.commit(); session.refresh(u)
    return u

@app.post("/auth/register")
def register(request: models.RegisterRequest):
    print(f"Registration attempt for: {request.email}")
    with Session(engine) as session:
        existing = session.exec(select(models.User).where(models.User.email == request.email)).first()
        if existing:
            print(f"User already exists: {request.email}")
            raise HTTPException(status_code=400, detail="User exists")
        user = create_user(session, request.email, request.password)
        print(f"User created successfully: {user.email}")
        token = auth.create_access_token({"sub": str(user.id), "email": user.email})
        return {"access_token": token, "token_type": "bearer"}

@app.post("/auth/token")
def login(request: models.LoginRequest):
    with Session(engine) as session:
        user = session.exec(select(models.User).where(models.User.email == request.email)).first()
        if not user:
            print(f"User not found: {request.email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        password_valid = auth.verify_password(request.password, user.hashed_password)
        if not password_valid:
            print(f"Password verification failed for user: {request.email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        token = auth.create_access_token({"sub": str(user.id), "email": user.email})
        return {"access_token": token, "token_type": "bearer"}

# Debug endpoint to list users (remove in production)
@app.get("/debug/users")
def list_users():
    with Session(engine) as session:
        users = session.exec(select(models.User)).all()
        return [{"id": u.id, "email": u.email} for u in users]

# Get current user info
@app.get("/auth/me")
def get_current_user(token: str = Depends(auth.oauth2_scheme)):
    payload = auth.decode_token(token)
    user_id = int(payload.get("sub"))
    email = payload.get("email")
    
    with Session(engine) as session:
        user = session.exec(select(models.User).where(models.User.id == user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "id": user.id,
            "email": user.email,
            "name": user.email.split("@")[0],  # Use email prefix as name
            "role": "teacher"  # Default role
        }

# Upload CSV
@app.post("/upload")
async def upload_csv(file: UploadFile = File(...), token: str = Depends(auth.oauth2_scheme)):
    # naive auth decode
    payload = auth.decode_token(token)
    user_id = int(payload.get("sub"))
    path = utils.save_upload_file(file)
    # store in DB
    with Session(engine) as session:
        up = models.Upload(filename=file.filename, filepath=path, uploaded_by=user_id)
        session.add(up); session.commit(); session.refresh(up)
        return {"id": up.id, "filename": up.filename, "path": up.filepath}

@app.get("/uploads")
def list_uploads(token: str = Depends(auth.oauth2_scheme)):
    payload = auth.decode_token(token)
    user_id = int(payload.get("sub"))
    with Session(engine) as session:
        items = session.exec(select(models.Upload).where(models.Upload.uploaded_by==user_id)).all()
        return items

# Run scheduler: algorithm = heuristic|ilp
@app.post("/run_scheduler")
def run_scheduler(algorithm: str = "heuristic", token: str = Depends(auth.oauth2_scheme)):
    payload = auth.decode_token(token)
    user_id = int(payload.get("sub"))
    # For demo: find the latest 3 CSVs by type in uploads directory
    # In production: store type metadata and parse properly
    uploads = os.listdir(utils.UPLOAD_DIR)
    # naive: look for teachers.csv subjects.csv rooms.csv availability.csv (case-insensitive)
    files = {name.lower(): None for name in uploads}
    for fname in uploads:
        files[fname.lower()] = os.path.join(utils.UPLOAD_DIR, fname)
    # Attempt to load
    teachers = None; subjects = None; rooms = None; availability = None
    def load_if(name):
        for k,v in files.items():
            if name in k:
                return pd.read_csv(v)
        return None
    teachers = load_if("teacher")
    subjects = load_if("subject")
    rooms = load_if("room")
    availability = load_if("avail")
    data = {"teachers": teachers, "subjects": subjects, "rooms": rooms, "availability": availability}
    cfg = scheduler.default_config()
    if algorithm == "ilp":
        events = scheduler.run_ilp(data, cfg)
    else:
        events = scheduler.run_heuristic(data, cfg)
    # Return events JSON; also could save to DB
    return {"events": events}
