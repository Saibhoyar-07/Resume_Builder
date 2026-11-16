import re
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl, field_validator


class SkillIn(BaseModel):
    category: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=120)


class ProjectIn(BaseModel):
    name: str = Field(default="", max_length=200)
    technologies: str = Field(default="", max_length=1000)
    description: str = Field(default="", max_length=5000)
    dates: str = Field(default="", max_length=100)
    link: str = Field(default="", max_length=500)
    bullets: list[str] = Field(default_factory=list, max_length=30)

    @field_validator("link")
    @classmethod
    def validate_link(cls, value: str) -> str:
        return validate_url(value)


class ExperienceIn(BaseModel):
    title: str = Field(default="", max_length=200)
    company: str = Field(default="", max_length=200)
    start_date: str = Field(default="", max_length=20)
    end_date: str = Field(default="", max_length=20)
    current: bool = False
    description: str = Field(default="", max_length=5000)
    bullets: list[str] = Field(default_factory=list, max_length=30)


class EducationIn(BaseModel):
    degree: str = Field(default="", max_length=200)
    institution: str = Field(default="", max_length=200)
    start_year: str = Field(default="", max_length=10)
    end_year: str = Field(default="", max_length=10)
    grade: str = Field(default="", max_length=80)
    coursework: str = Field(default="", max_length=2000)


class CertificationIn(BaseModel):
    name: str = Field(default="", max_length=200)
    organization: str = Field(default="", max_length=200)
    date: str = Field(default="", max_length=40)


class AchievementIn(BaseModel):
    name: str = Field(default="", max_length=300)
    organization: str = Field(default="", max_length=200)
    date: str = Field(default="", max_length=40)


class ResumeIn(BaseModel):
    target_title: str = Field(default="", max_length=200)
    job_description: str = Field(default="", max_length=12000)
    company_name: str = Field(default="", max_length=200)
    full_name: str = Field(default="", max_length=200)
    phone: str = Field(default="", max_length=50)
    email: EmailStr | None = None
    linkedin: str = Field(default="", max_length=500)
    github: str = Field(default="", max_length=500)
    portfolio: str = Field(default="", max_length=500)
    location: str = Field(default="", max_length=200)
    summary: str = Field(default="", max_length=3000)
    template: Literal["classic", "modern"] = "classic"
    section_order: list[str] = Field(default_factory=lambda: ["experience", "projects", "education", "skills", "certifications"])
    skills: list[SkillIn] = Field(default_factory=list, max_length=100)
    projects: list[ProjectIn] = Field(default_factory=list, max_length=50)
    experience: list[ExperienceIn] = Field(default_factory=list, max_length=50)
    education: list[EducationIn] = Field(default_factory=list, max_length=50)
    certifications: list[CertificationIn] = Field(default_factory=list, max_length=50)
    achievements: list[AchievementIn] = Field(default_factory=list, max_length=50)

    @field_validator("linkedin", "github", "portfolio")
    @classmethod
    def validate_optional_urls(cls, value: str) -> str:
        return validate_url(value)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        if value and not re.fullmatch(r"[+()\d.\-\s]{7,25}", value):
            raise ValueError("Enter a valid phone number.")
        return value

    @field_validator("section_order")
    @classmethod
    def validate_section_order(cls, value: list[str]) -> list[str]:
        allowed = {"experience", "projects", "education", "skills", "certifications", "achievements"}
        if len(value) != len(set(value)) or not set(value).issubset(allowed):
            raise ValueError("Section order must contain unique standard section names.")
        return value


def validate_url(value: str) -> str:
    if value and not value.startswith(("http://", "https://")):
        value = "https://" + value
    if value:
        HttpUrl(value)
    return value


class ResumeOut(ResumeIn):
    model_config = ConfigDict(from_attributes=True)
    id: str

    @classmethod
    def from_record(cls, resume):
        return cls(
            id=resume.id,
            target_title=resume.target_title,
            job_description=resume.job_description,
            company_name=resume.company_name,
            full_name=resume.full_name,
            phone=resume.phone,
            email=resume.email or None,
            linkedin=resume.linkedin,
            github=resume.github,
            portfolio=resume.portfolio,
            location=resume.location,
            summary=resume.summary,
            template=resume.template,
            section_order=[item for item in resume.section_order.split(",") if item],
            skills=[{"category": item.category, "name": item.name} for item in resume.skills],
            projects=[{"name": item.name, "technologies": item.technologies, "description": item.description, "dates": item.dates, "link": item.link, "bullets": item.bullets.splitlines()} for item in resume.projects],
            experience=[{"title": item.title, "company": item.company, "start_date": item.start_date, "end_date": item.end_date, "current": item.current, "description": item.description, "bullets": item.bullets.splitlines()} for item in resume.experience],
            education=[{"degree": item.degree, "institution": item.institution, "start_year": item.start_year, "end_year": item.end_year, "grade": item.grade, "coursework": item.coursework} for item in resume.education],
            certifications=[{"name": item.name, "organization": item.organization, "date": item.date} for item in resume.certifications],
            achievements=[{"name": item.name, "organization": item.organization, "date": item.date} for item in resume.achievements],
        )
