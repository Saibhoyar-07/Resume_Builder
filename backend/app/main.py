from contextlib import asynccontextmanager
import os

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, selectinload

from .database import Base, engine, get_db
from .models import Achievement, Certification, Education, Experience, Project, Resume, Skill
from .schemas import ResumeIn, ResumeOut


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Resume Builder API", version="1.0.0", lifespan=lifespan)
origins = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def fetch_resume(db: Session, resume_id: str) -> Resume:
    record = (
        db.query(Resume)
        .options(
            selectinload(Resume.skills),
            selectinload(Resume.projects),
            selectinload(Resume.experience),
            selectinload(Resume.education),
            selectinload(Resume.certifications),
            selectinload(Resume.achievements),
        )
        .filter(Resume.id == resume_id)
        .first()
    )
    if record is None:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return record


def update_record(record: Resume, payload: ResumeIn) -> None:
    for field in (
        "target_title", "job_description", "company_name", "full_name", "phone",
        "email", "linkedin", "github", "portfolio", "location", "summary", "template",
    ):
        value = getattr(payload, field)
        setattr(record, field, str(value) if field == "email" and value else (value or ""))
    record.section_order = ",".join(payload.section_order)
    record.skills = [Skill(category=item.category.strip(), name=item.name.strip(), position=i) for i, item in enumerate(payload.skills)]
    record.projects = [
        Project(name=item.name, technologies=item.technologies, description=item.description, dates=item.dates, link=item.link, bullets="\n".join(item.bullets), position=i)
        for i, item in enumerate(payload.projects)
    ]
    record.experience = [
        Experience(title=item.title, company=item.company, start_date=item.start_date, end_date=item.end_date, current=item.current, description=item.description, bullets="\n".join(item.bullets), position=i)
        for i, item in enumerate(payload.experience)
    ]
    record.education = [
        Education(degree=item.degree, institution=item.institution, start_year=item.start_year, end_year=item.end_year, grade=item.grade, coursework=item.coursework, position=i)
        for i, item in enumerate(payload.education)
    ]
    record.certifications = [
        Certification(name=item.name, organization=item.organization, date=item.date, position=i)
        for i, item in enumerate(payload.certifications)
    ]
    record.achievements = [
        Achievement(name=item.name, organization=item.organization, date=item.date, position=i)
        for i, item in enumerate(payload.achievements)
    ]


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/resumes", response_model=list[ResumeOut])
def list_resumes(db: Session = Depends(get_db)):
    records = db.query(Resume.id).order_by(Resume.created_at.asc()).all()
    return [ResumeOut.from_record(fetch_resume(db, item.id)) for item in records]


@app.post("/api/resumes", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
def create_resume(payload: ResumeIn, db: Session = Depends(get_db)):
    record = Resume()
    update_record(record, payload)
    db.add(record)
    db.commit()
    return ResumeOut.from_record(fetch_resume(db, record.id))


@app.get("/api/resumes/{resume_id}", response_model=ResumeOut)
def get_resume(resume_id: str, db: Session = Depends(get_db)):
    return ResumeOut.from_record(fetch_resume(db, resume_id))


@app.put("/api/resumes/{resume_id}", response_model=ResumeOut)
def replace_resume(resume_id: str, payload: ResumeIn, db: Session = Depends(get_db)):
    record = fetch_resume(db, resume_id)
    update_record(record, payload)
    db.commit()
    return ResumeOut.from_record(fetch_resume(db, resume_id))


@app.delete("/api/resumes/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(resume_id: str, db: Session = Depends(get_db)):
    record = db.get(Resume, resume_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Resume not found.")
    db.delete(record)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
