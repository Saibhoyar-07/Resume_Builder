import atexit
import os
import tempfile

from fastapi.testclient import TestClient

db_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
db_file.close()
os.environ["DATABASE_URL"] = f"sqlite:///{db_file.name}"

from app.main import app  # noqa: E402
from app.database import engine  # noqa: E402


def cleanup_database():
    engine.dispose()
    if os.path.exists(db_file.name):
        os.unlink(db_file.name)


atexit.register(cleanup_database)


def test_resume_crud_and_nested_data():
    with TestClient(app) as client:
        payload = {
            "full_name": "Jordan Lee",
            "email": "jordan@example.com",
            "skills": [{"category": "Programming Languages", "name": "Python"}],
            "projects": [{"name": "API", "bullets": ["Built a documented API"]}],
            "experience": [{"title": "Developer", "company": "Studio", "current": True}],
            "education": [{"degree": "BSc Computer Science", "end_year": "2025"}],
            "certifications": [{"name": "Cloud Basics", "organization": "Example"}],
            "achievements": [{"name": "Hackathon finalist"}],
        }
        created = client.post("/api/resumes", json=payload)
        assert created.status_code == 201
        resume_id = created.json()["id"]
        assert created.json()["projects"][0]["bullets"] == ["Built a documented API"]
        assert client.get(f"/api/resumes/{resume_id}").json()["full_name"] == "Jordan Lee"
        changed = {**payload, "full_name": "Jordan L."}
        assert client.put(f"/api/resumes/{resume_id}", json=changed).json()["full_name"] == "Jordan L."
        assert len(client.get("/api/resumes").json()) == 1
        assert client.delete(f"/api/resumes/{resume_id}").status_code == 204
        assert client.get(f"/api/resumes/{resume_id}").status_code == 404


def test_invalid_email_and_section_order_return_validation_errors():
    with TestClient(app) as client:
        invalid_email = client.post("/api/resumes", json={"email": "not-an-email"})
        invalid_order = client.post("/api/resumes", json={"section_order": ["skills", "skills"]})
        assert invalid_email.status_code == 422
        assert invalid_order.status_code == 422


def test_optional_urls_accept_hostnames_and_reject_invalid_values():
    with TestClient(app) as client:
        accepted = client.post("/api/resumes", json={"linkedin": "linkedin.com/in/jordan"})
        assert accepted.status_code == 201
        assert accepted.json()["linkedin"] == "https://linkedin.com/in/jordan"
        rejected = client.post("/api/resumes", json={"portfolio": "not a url"})
        assert rejected.status_code == 422
        invalid_phone = client.post("/api/resumes", json={"phone": "call me"})
        invalid_project_link = client.post("/api/resumes", json={"projects": [{"link": "not a url"}]})
        assert invalid_phone.status_code == 422
        assert invalid_project_link.status_code == 422
