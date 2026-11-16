import { useEffect, useMemo, useState } from "react";
import ResumePreview from "./ResumePreview.jsx";
import { validateStep } from "./validation.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const CATEGORIES = [
  "Programming Languages", "Databases", "Fundamentals",
  "Tools & Version Control", "Web Technologies", "Other relevant skills",
];
const steps = [
  { title: "Target job", caption: "Tailor with intent", icon: "01" },
  { title: "Personal details", caption: "Make contact easy", icon: "02" },
  { title: "Summary", caption: "Your opening story", icon: "03" },
  { title: "Technical skills", caption: "Show your toolkit", icon: "04" },
  { title: "Projects", caption: "Show what you built", icon: "05" },
  { title: "Experience", caption: "Bring your work to life", icon: "06" },
  { title: "Education", caption: "Add your education", icon: "07" },
  { title: "Certifications", caption: "Add your highlights", icon: "08" },
];
const sampleData = {
  target_title: "Python Developer | Backend Services & REST APIs",
  job_description: "",
  company_name: "",
  full_name: "Sai Bhoyar",
  phone: "+91 7249745225",
  email: "saibhoyar12345@gmail.com",
  linkedin: "linkedin.com/in/sai-bhoyar-74469b326",
  github: "github.com/Saibhoyar-07",
  portfolio: "sai-bhoyar-portfolio.vercel.app",
  location: "Nagpur, India",
  summary: "",
  template: "classic",
  section_order: ["experience", "projects", "education", "skills", "certifications"],
  skills: [
    ["Programming Languages", "Python"], ["Programming Languages", "SQL"],
    ["Programming Languages", "C++"], ["Programming Languages", "JavaScript"],
    ["Web Technologies", "HTML5"], ["Web Technologies", "CSS3"],
    ["Web Technologies", "FastAPI"], ["Web Technologies", "Flask"],
    ["Databases", "PostgreSQL"], ["Databases", "MySQL"],
    ["Tools & Version Control", "Git"], ["Tools & Version Control", "GitHub"],
    ["Tools & Version Control", "Postman"], ["Web Technologies", "React.js"],
    ["Web Technologies", "Node.js"],
  ].map(([category, name]) => ({ category, name })),
  projects: [
    { name: "PlugBox – Smart EV Charging Platform", technologies: "Python, FastAPI, SQLAlchemy, PostgreSQL, MQTT, Socket.IO", description: "", dates: "", link: "", bullets: [] },
    { name: "Personal Portfolio Website", technologies: "", description: "", dates: "", link: "", bullets: [] },
  ],
  experience: [
    { title: "Full Stack Developer Intern", company: "Syncess Technology", start_date: "2025-07", end_date: "", current: true, description: "", bullets: [] },
  ],
  education: [
    { degree: "B.E. in Computer Science and Engineering", institution: "G H Raisoni College of Engineering", start_year: "2022", end_year: "2026", grade: "CGPA 7.56", coursework: "" },
  ],
  certifications: [
    { name: "Full Stack Development", organization: "", date: "" },
    { name: "Data Structures & Algorithms", organization: "", date: "" },
  ],
  achievements: [
    { name: "Top 5 Finalist at National Technical Hackathon (Rackathon 2025)", organization: "", date: "" },
    { name: "Published research paper on smart EV charging", organization: "", date: "" },
  ],
};

const blankData = {
  target_title: "", job_description: "", company_name: "", full_name: "", phone: "",
  email: "", linkedin: "", github: "", portfolio: "", location: "", summary: "",
  template: "classic",
  section_order: ["experience", "projects", "education", "skills", "certifications"],
  skills: [], projects: [], experience: [], education: [], certifications: [], achievements: [],
};
const keywords = [
  "Python", "Java", "JavaScript", "TypeScript", "C++", "SQL", "FastAPI", "Flask",
  "Django", "React", "Node.js", "HTML", "CSS", "REST APIs", "PostgreSQL", "MySQL",
  "MongoDB", "Redis", "AWS", "Docker", "Kubernetes", "Git", "GitHub", "CI/CD",
  "Linux", "Agile", "testing", "communication", "leadership", "problem solving",
  "data structures", "machine learning", "API", "microservices",
];
const stopWords = new Set(["this", "that", "with", "from", "have", "will", "your", "their", "about", "years", "year", "work", "team", "role", "must", "able", "using", "into", "including", "such", "other", "some", "more"]);

function Field({ label, value, onChange, type = "text", placeholder = "", required = false, hint = "", multiline = false, rows = 3, error = "", ...props }) {
  const id = props.id || `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const Control = multiline ? "textarea" : "input";
  return (
    <label className={`field ${error ? "field-error" : ""}`} htmlFor={id}>
      <span className="field-label">{label}{required && <span className="required-mark"> *</span>}</span>
      {hint && <span className="field-hint">{hint}</span>}
      <Control
        id={id}
        type={multiline ? undefined : type}
        rows={multiline ? rows : undefined}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && <span className="field-error-text" id={`${id}-error`}>{error}</span>}
    </label>
  );
}

function ListCard({ title, subtitle, onRemove, children }) {
  return (
    <div className="list-card">
      <div className="list-card-head">
        <div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>
        <button className="icon-button remove-button" type="button" onClick={onRemove} aria-label={`Remove ${title}`}>×</button>
      </div>
      {children}
    </div>
  );
}

function BulletEditor({ value, onChange, label = "Contribution bullets" }) {
  const bullets = value?.length ? value : [""];
  const update = (index, text) => onChange(bullets.map((item, i) => i === index ? text : item));
  const add = () => onChange([...bullets, ""]);
  const remove = (index) => onChange(bullets.filter((_, i) => i !== index));
  return (
    <div className="bullet-editor">
      <span className="field-label">{label}</span>
      {bullets.map((bullet, index) => (
        <div className="bullet-row" key={index}>
          <span className="bullet-dot" aria-hidden="true">•</span>
          <input aria-label={`${label} ${index + 1}`} value={bullet} onChange={(event) => update(index, event.target.value)} placeholder="Describe a contribution or outcome" />
          {bullets.length > 1 && <button className="tiny-remove" type="button" onClick={() => remove(index)} aria-label={`Remove bullet ${index + 1}`}>×</button>}
        </div>
      ))}
      <button className="text-button add-bullet" type="button" onClick={add}>+ Add bullet</button>
    </div>
  );
}

function App() {
  const [data, setData] = useState(blankData);
  const [step, setStep] = useState(0);
  const [resumeId, setResumeId] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(motionPreference.matches);
    const handleChange = (event) => setReduceMotion(event.matches);
    motionPreference.addEventListener?.("change", handleChange);
    return () => motionPreference.removeEventListener?.("change", handleChange);
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/api/resumes`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not retrieve saved resumes.");
        return response.json();
      })
      .then((items) => {
        if (!active || !items.length) return;
        const latest = items[items.length - 1];
        setData({ ...blankData, ...latest });
        setResumeId(latest.id);
        setSaveMessage("Your latest saved resume is ready.");
      })
      .catch(() => {
        if (active) setErrorMessage("Resume API is offline. You can still build and print your resume; saving will work when the API is running.");
      });
    return () => { active = false; };
  }, []);

  const setField = (field, value) => {
    setData((current) => ({ ...current, [field]: value }));
    setSaveMessage("");
    setErrorMessage("");
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  };

  const updateList = (field, index, values) => setData((current) => ({
    ...current,
    [field]: current[field].map((item, i) => i === index ? { ...item, ...values } : item),
  }));
  const addListItem = (field, value) => setData((current) => ({ ...current, [field]: [...current[field], value] }));
  const removeListItem = (field, index) => setData((current) => ({ ...current, [field]: current[field].filter((_, i) => i !== index) }));

  const suggestions = useMemo(() => {
    const job = data.job_description.toLowerCase();
    const present = data.skills.map((skill) => skill.name.toLowerCase());
    return keywords.filter((keyword) =>
      job.includes(keyword.toLowerCase()) &&
      !present.some((skill) => skill === keyword.toLowerCase() || skill.includes(keyword.toLowerCase())),
    ).slice(0, 10);
  }, [data.job_description, data.skills]);

  const jobKeywords = useMemo(() => {
    const tokens = data.job_description.match(/[a-z][a-z+#./-]{3,}/gi) || [];
    return [...new Set(tokens.map((word) => word.toLowerCase()).filter((word) => !stopWords.has(word)))].slice(0, 35);
  }, [data.job_description]);
  const allResumeText = useMemo(() => {
    const { job_description: _jobDescription, ...resumeContent } = data;
    return JSON.stringify(resumeContent).toLowerCase();
  }, [data]);
  const matchedKeywords = jobKeywords.filter((word) => allResumeText.includes(word));
  const missingKeywords = jobKeywords.filter((word) => !allResumeText.includes(word));

  const checklist = [
    { label: "Contact details included", done: Boolean(data.full_name && data.email && data.phone) },
    { label: "Professional summary added", done: Boolean(data.summary.trim()) },
    { label: "Experience or projects listed", done: data.experience.some((item) => item.title || item.company) || data.projects.some((item) => item.name) },
    { label: "Education included", done: data.education.some((item) => item.degree || item.institution) },
    { label: "Relevant job keywords present", done: matchedKeywords.length > 0 },
    { label: "Standard headings and readable layout", done: true },
  ];
  const score = Math.round(checklist.filter((item) => item.done).length / checklist.length * 100);

  const moveStep = (direction) => {
    if (direction > 0) {
      const errors = validateStep(step, data);
      setFieldErrors(errors);
      if (Object.keys(errors).length > 0) return;
    }
    const next = Math.max(0, Math.min(steps.length - 1, step + direction));
    setStep(next);
    setFieldErrors({});
    document.querySelector(".editor-panel")?.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const addSuggestedSkill = (skill) => {
    const category = CATEGORIES.find((item) => item === "Programming Languages" && /^(python|java|javascript|typescript|c\+\+|sql)$/i.test(skill))
      || CATEGORIES.find((item) => item === "Databases" && /postgresql|mysql|mongodb|redis/i.test(skill))
      || CATEGORIES.find((item) => item === "Tools & Version Control" && /git|github|docker|kubernetes|aws|linux|ci\/cd/i.test(skill))
      || CATEGORIES.find((item) => item === "Web Technologies" && /fastapi|flask|django|react|node|html|css|api|microservices/i.test(skill))
      || "Other relevant skills";
    addListItem("skills", { category, name: skill });
  };

  const draftSummary = () => {
    const skills = data.skills.map((item) => item.name.trim()).filter(Boolean).slice(0, 6);
    const roles = data.experience.map((item) => item.title.trim()).filter(Boolean);
    const projects = data.projects.map((item) => item.name.trim()).filter(Boolean);
    const sentences = [];
    if (data.target_title.trim()) sentences.push(`Professional focused on ${data.target_title.trim()}.`);
    if (roles.length) sentences.push(`Experience includes ${roles.join(", ")}.`);
    if (projects.length) sentences.push(`Project work includes ${projects.join(", ")}.`);
    if (skills.length) sentences.push(`Skills include ${skills.join(", ")}.`);
    if (!sentences.length) {
      setErrorMessage("Add your target title, skills, projects, or experience before drafting a summary.");
      return;
    }
    setField("summary", sentences.join(" "));
  };

  const saveResume = async () => {
    setSaving(true);
    setSaveMessage("");
    setErrorMessage("");
    const payload = { ...data, email: data.email.trim() || null };
    try {
      const response = await fetch(resumeId ? `${API_URL}/api/resumes/${resumeId}` : `${API_URL}/api/resumes`, {
        method: resumeId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = Array.isArray(result.detail)
          ? result.detail.map((item) => `${item.loc?.slice(-1)[0] || "Field"}: ${item.msg}`).join(" ")
          : result.detail || "Could not save your resume.";
        throw new Error(detail);
      }
      setResumeId(result.id);
      setSaveMessage("Saved just now.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to save. Check that the backend is running and try again.");
    } finally {
      setSaving(false);
    }
  };

  const useSample = () => {
    setData({ ...sampleData, section_order: [...sampleData.section_order], skills: [...sampleData.skills], projects: sampleData.projects.map((item) => ({ ...item, bullets: [...item.bullets] })), experience: sampleData.experience.map((item) => ({ ...item, bullets: [...item.bullets] })), education: [...sampleData.education], certifications: [...sampleData.certifications], achievements: [...sampleData.achievements] });
    setResumeId("");
    setSaveMessage("Sample loaded. Personalize it before using.");
    setErrorMessage("");
  };

  const renderStep = () => {
    if (step === 0) return (
      <>
        <div className="section-intro"><span className="eyebrow">LET'S GET FOCUSED</span><h2>Start with the role</h2><p>A clear target helps you tailor your resume. Suggestions come from this job description and always need your confirmation.</p></div>
        <div className="form-grid">
          <Field label="Target job title" value={data.target_title} onChange={(value) => setField("target_title", value)} required placeholder="e.g. Product Designer" error={fieldErrors.target_title} />
          <Field label="Company name" value={data.company_name} onChange={(value) => setField("company_name", value)} placeholder="Optional" />
        </div>
        <Field label="Job description" value={data.job_description} onChange={(value) => setField("job_description", value)} multiline rows={9} hint="Paste the role description to see keyword matches and skill suggestions." placeholder="Paste the job description here…" />
        {suggestions.length > 0 && <div className="suggestion-box">
          <div className="suggestion-heading"><span className="sparkle">✳</span><div><strong>Skills mentioned in this job</strong><p>Confirm only the skills you actually have.</p></div></div>
          <div className="chip-list">{suggestions.map((skill) => <button key={skill} className="suggestion-chip" type="button" onClick={() => addSuggestedSkill(skill)}>+ {skill}</button>)}</div>
        </div>}
      </>
    );
    if (step === 1) return (
      <>
        <div className="section-intro"><span className="eyebrow">FIRST IMPRESSIONS</span><h2>Personal details</h2><p>Use the contact information you want recruiters to use.</p></div>
        <div className="form-grid">
          <Field label="Full name" value={data.full_name} onChange={(value) => setField("full_name", value)} required placeholder="Your name" error={fieldErrors.full_name} />
          <Field label="Phone number" value={data.phone} onChange={(value) => setField("phone", value)} type="tel" placeholder="+1 (555) 000-0000" error={fieldErrors.phone} />
          <Field label="Email address" value={data.email} onChange={(value) => setField("email", value)} type="email" placeholder="you@example.com" error={fieldErrors.email} />
          <Field label="Location" value={data.location} onChange={(value) => setField("location", value)} placeholder="City, Country · optional" />
          <Field label="LinkedIn URL" value={data.linkedin} onChange={(value) => setField("linkedin", value)} placeholder="linkedin.com/in/you" error={fieldErrors.linkedin} />
          <Field label="GitHub URL" value={data.github} onChange={(value) => setField("github", value)} placeholder="github.com/you" error={fieldErrors.github} />
          <Field label="Portfolio URL" value={data.portfolio} onChange={(value) => setField("portfolio", value)} placeholder="yourportfolio.com" error={fieldErrors.portfolio} />
        </div>
      </>
    );
    if (step === 2) return (
      <>
        <div className="section-intro"><span className="eyebrow">YOUR INTRODUCTION</span><h2>Professional summary</h2><p>Write a few sentences about your real experience and strengths. Keep it specific and in your own voice.</p></div>
        <div className="draft-bar"><div><strong>Need a starting point?</strong><span>Draft uses only details already in this form.</span></div><button type="button" className="button button-soft" onClick={draftSummary}>Draft from my details <span aria-hidden="true">↗</span></button></div>
        <Field label="Your summary" value={data.summary} onChange={(value) => setField("summary", value)} multiline rows={9} placeholder="Summarize your professional focus, experience, and strengths…" />
        <p className="character-count">{data.summary.length}/3000 characters</p>
        <div className="notice"><span>i</span><p>Review and edit any suggested draft. It will never add achievements or qualifications you did not provide.</p></div>
      </>
    );
    if (step === 3) return (
      <>
        <div className="section-intro"><span className="eyebrow">WHAT YOU BRING</span><h2>Technical skills</h2><p>Add skills you can confidently discuss. Job-description suggestions are optional until you add them.</p></div>
        {CATEGORIES.map((category) => <div className="skill-group" key={category}>
          <label className="field-label">{category}</label>
          <div className="skill-input-list">
            {data.skills.map((skill, index) => skill.category === category && (
              <span className="skill-token" key={`${category}-${index}`}>{skill.name}<button type="button" aria-label={`Remove ${skill.name}`} onClick={() => removeListItem("skills", index)}>×</button></span>
            ))}
            <SkillAdder category={category} onAdd={(name) => addListItem("skills", { category, name })} />
          </div>
        </div>)}
      </>
    );
    if (step === 4) return (
      <>
        <div className="section-intro"><span className="eyebrow">MAKE IT TANGIBLE</span><h2>Projects</h2><p>Highlight work you contributed to. Keep descriptions factual and specific.</p></div>
        {data.projects.map((item, index) => <ListCard key={index} title={item.name || `Project ${index + 1}`} onRemove={() => removeListItem("projects", index)}>
          <div className="form-grid">
            <Field label="Project name" value={item.name} onChange={(value) => updateList("projects", index, { name: value })} placeholder="Project name" />
            <Field label="Technologies used" value={item.technologies} onChange={(value) => updateList("projects", index, { technologies: value })} placeholder="Separate with commas" />
            <Field label="Dates" value={item.dates} onChange={(value) => updateList("projects", index, { dates: value })} placeholder="e.g. Mar 2025 – Jun 2025" />
            <Field label="Project link" value={item.link} onChange={(value) => updateList("projects", index, { link: value })} placeholder="Optional URL" />
          </div>
          <Field label="Description" value={item.description} onChange={(value) => updateList("projects", index, { description: value })} multiline rows={3} placeholder="Briefly explain the project…" />
          <BulletEditor value={item.bullets} onChange={(bullets) => updateList("projects", index, { bullets })} label="Your contributions" />
        </ListCard>)}
        <button type="button" className="button button-outline add-entry" onClick={() => addListItem("projects", { name: "", technologies: "", description: "", dates: "", link: "", bullets: [] })}>+ Add project</button>
      </>
    );
    if (step === 5) return (
      <>
        <div className="section-intro"><span className="eyebrow">YOUR EXPERIENCE</span><h2>Work & experience</h2><p>Include paid work, internships, volunteering, or other relevant experience.</p></div>
        {data.experience.map((item, index) => <ListCard key={index} title={item.title || `Experience ${index + 1}`} onRemove={() => removeListItem("experience", index)}>
          <div className="form-grid">
            <Field label="Job title" value={item.title} onChange={(value) => updateList("experience", index, { title: value })} placeholder="e.g. Software Engineer" />
            <Field label="Company or organization" value={item.company} onChange={(value) => updateList("experience", index, { company: value })} placeholder="Organization name" />
            <Field label="Start month" value={item.start_date} onChange={(value) => updateList("experience", index, { start_date: value })} type="month" />
            {!item.current && <Field label="End month" value={item.end_date} onChange={(value) => updateList("experience", index, { end_date: value })} type="month" />}
          </div>
          <label className="checkbox-row"><input type="checkbox" checked={item.current} onChange={(event) => updateList("experience", index, { current: event.target.checked, end_date: event.target.checked ? "" : item.end_date })} /><span>I currently work here</span></label>
          <Field label="Role description" value={item.description} onChange={(value) => updateList("experience", index, { description: value })} multiline rows={3} placeholder="Optional context about your role…" />
          <BulletEditor value={item.bullets} onChange={(bullets) => updateList("experience", index, { bullets })} label="Responsibilities & achievements" />
        </ListCard>)}
        <button type="button" className="button button-outline add-entry" onClick={() => addListItem("experience", { title: "", company: "", start_date: "", end_date: "", current: false, description: "", bullets: [] })}>+ Add experience</button>
      </>
    );
    if (step === 6) return (
      <>
        <div className="section-intro"><span className="eyebrow">FOUNDATIONS</span><h2>Education</h2><p>List your education in reverse chronological order where possible.</p></div>
        {data.education.map((item, index) => <ListCard key={index} title={item.degree || `Education ${index + 1}`} onRemove={() => removeListItem("education", index)}>
          <div className="form-grid">
            <Field label="Degree & field of study" value={item.degree} onChange={(value) => updateList("education", index, { degree: value })} placeholder="e.g. BSc, Computer Science" />
            <Field label="College or university" value={item.institution} onChange={(value) => updateList("education", index, { institution: value })} placeholder="Institution name" />
            <Field label="Start year" value={item.start_year} onChange={(value) => updateList("education", index, { start_year: value })} type="number" min="1950" max="2100" placeholder="2022" />
            <Field label="End year" value={item.end_year} onChange={(value) => updateList("education", index, { end_year: value })} type="number" min="1950" max="2100" placeholder="2026" />
            <Field label="CGPA or percentage" value={item.grade} onChange={(value) => updateList("education", index, { grade: value })} placeholder="Optional" />
            <Field label="Relevant coursework" value={item.coursework} onChange={(value) => updateList("education", index, { coursework: value })} placeholder="Optional, separate with commas" />
          </div>
        </ListCard>)}
        <button type="button" className="button button-outline add-entry" onClick={() => addListItem("education", { degree: "", institution: "", start_year: "", end_year: "", grade: "", coursework: "" })}>+ Add education</button>
      </>
    );
    return (
      <>
        <div className="section-intro"><span className="eyebrow">THE EXTRA DETAILS</span><h2>Certifications & achievements</h2><p>Add certifications, awards, publications, or other achievements you would like to share.</p></div>
        <h3 className="subsection-title">Certifications</h3>
        {data.certifications.map((item, index) => <ListCard key={index} title={item.name || `Certification ${index + 1}`} onRemove={() => removeListItem("certifications", index)}>
          <div className="form-grid three-col">
            <Field label="Name" value={item.name} onChange={(value) => updateList("certifications", index, { name: value })} placeholder="Certification name" />
            <Field label="Issuing organization" value={item.organization} onChange={(value) => updateList("certifications", index, { organization: value })} placeholder="Organization" />
            <Field label="Date" value={item.date} onChange={(value) => updateList("certifications", index, { date: value })} placeholder="Month / year" />
          </div>
        </ListCard>)}
        <button type="button" className="button button-outline add-entry" onClick={() => addListItem("certifications", { name: "", organization: "", date: "" })}>+ Add certification</button>
        <div className="subsection-heading"><h3 className="subsection-title">Achievements, awards & publications</h3><button type="button" className="text-button" onClick={() => addListItem("achievements", { name: "", organization: "", date: "" })}>+ Add item</button></div>
        {data.achievements.map((item, index) => <ListCard key={index} title={item.name || `Achievement ${index + 1}`} onRemove={() => removeListItem("achievements", index)}>
          <div className="form-grid three-col">
            <Field label="Name" value={item.name} onChange={(value) => updateList("achievements", index, { name: value })} placeholder="Award or publication" />
            <Field label="Organization" value={item.organization} onChange={(value) => updateList("achievements", index, { organization: value })} placeholder="Optional" />
            <Field label="Date" value={item.date} onChange={(value) => updateList("achievements", index, { date: value })} placeholder="Optional" />
          </div>
        </ListCard>)}
        <button type="button" className="button button-outline add-entry" onClick={() => addListItem("achievements", { name: "", organization: "", date: "" })}>+ Add achievement</button>
      </>
    );
  };

  return (
    <div className={`app-shell ${reduceMotion ? "reduce-motion" : ""}`}>
      <header className="topbar">
        <a className="brand" href="#" aria-label="Resume Builder home"><span className="brand-mark">r</span><span>resume<span className="brand-light">builder</span></span></a>
        <div className="topbar-right">
          <span className="autosave-indicator"><span className="status-dot" />{saveMessage || "Unsaved changes"}</span>
          <button type="button" className="button button-save" onClick={saveResume} disabled={saving}>{saving ? "Saving…" : "Save resume"}</button>
          <button type="button" className="sample-link" onClick={useSample}>Load sample</button>
        </div>
      </header>

      <main className="builder-shell">
        <aside className="sidebar">
          <div className="sidebar-title"><span className="eyebrow">YOUR WORKSPACE</span><h1>Build your<br />next chapter.</h1><p>A thoughtful resume, one step at a time.</p></div>
          <nav className="step-nav" aria-label="Resume sections">
            {steps.map((item, index) => (
              <button type="button" className={`step-link ${step === index ? "active" : ""} ${step > index ? "complete" : ""}`} key={item.title} onClick={() => {
                if (index <= step) { setStep(index); setFieldErrors({}); return; }
                const errors = validateStep(step, data);
                setFieldErrors(errors);
                if (Object.keys(errors).length === 0) setStep(index);
              }} aria-current={step === index ? "step" : undefined}>
                <span className="step-number">{step > index ? "✓" : item.icon}</span>
                <span className="step-copy"><strong>{item.title}</strong><small>{item.caption}</small></span>
                {step === index && <span className="active-chevron" aria-hidden="true">›</span>}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer"><span className="privacy-icon">◈</span><p>Your details stay yours.<br /><span>Saved to your local API database.</span></p></div>
        </aside>

        <section className="editor-panel" aria-live="polite">
          <div className="editor-topline"><span>RESUME DETAILS</span><span>{String(step + 1).padStart(2, "0")} <i>/</i> {String(steps.length).padStart(2, "0")}</span></div>
          <div className="progress-track"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
          <div className="editor-content">
            {renderStep()}
            {errorMessage && <div className="alert alert-error" role="alert"><span>!</span>{errorMessage}</div>}
          </div>
          <div className="editor-footer">
            <button type="button" className="button button-back" onClick={() => moveStep(-1)} disabled={step === 0}>← <span>Back</span></button>
            <div className="footer-right">
              <button type="button" className="preview-link" onClick={() => { setPreviewVisible(true); document.querySelector(".preview-panel")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); }}>Preview resume <span>↗</span></button>
              {step < steps.length - 1
                ? <button type="button" className="button button-primary" onClick={() => moveStep(1)}>Continue <span>→</span></button>
                : <button type="button" className="button button-primary" onClick={() => window.print()}>Download PDF <span>↓</span></button>}
            </div>
          </div>
        </section>

        <aside className={`preview-panel ${previewVisible ? "preview-focused" : ""}`}>
          <div className="preview-heading">
            <div><span className="eyebrow">LIVE PREVIEW</span><h2>Your resume</h2></div>
            <button type="button" className="button button-preview-download" onClick={() => window.print()} aria-label="Download resume as PDF">↓ <span>PDF</span></button>
          </div>
          <div className="preview-toolbar">
            <label htmlFor="resume-template">Template</label>
            <select id="resume-template" value={data.template} onChange={(event) => setField("template", event.target.value)}>
              <option value="classic">Classic</option><option value="modern">Modern</option>
            </select>
            <span className="ats-plain-label"><span /> ATS-friendly</span>
          </div>
          <div className="paper-wrap"><ResumePreview data={data} /></div>
          <section className="ats-card" aria-labelledby="ats-heading">
            <div className="ats-card-head"><div><span className="eyebrow">QUICK CHECK</span><h3 id="ats-heading">ATS readiness</h3></div><div className="score-pill"><strong>{score}</strong><small>estimate</small></div></div>
            <p className="ats-explainer">An estimate of resume completeness and readable formatting—not a hiring prediction.</p>
            <div className="check-list">{checklist.map((item) => <div className="check-item" key={item.label}><span className={item.done ? "check-icon done" : "check-icon"}>{item.done ? "✓" : "○"}</span><span>{item.label}</span></div>)}</div>
            {jobKeywords.length > 0 && <div className="keyword-area">
              <div className="keyword-head"><strong>Job description keywords</strong><span>{matchedKeywords.length} matched</span></div>
              {matchedKeywords.length > 0 && <div className="keyword-chips">{matchedKeywords.slice(0, 8).map((word) => <span className="keyword-match" key={word}>{word}</span>)}</div>}
              {missingKeywords.length > 0 && <p className="missing-terms"><strong>Consider reviewing:</strong> {missingKeywords.slice(0, 6).join(", ")}. Add only where accurate.</p>}
            </div>}
          </section>
          <div className="section-order-card">
            <div className="section-order-title"><div><span className="eyebrow">MAKE IT YOURS</span><h3>Section order</h3></div><span className="order-arrows">↕</span></div>
            <p>Move standard sections to fit your story.</p>
            <div className="order-list">{data.section_order.map((section, index) => (
              <div className="order-item" key={section}><span className="drag-dots">⠿</span><span>{section[0].toUpperCase() + section.slice(1)}</span>
                <div className="order-controls">
                  <button type="button" onClick={() => {
                    if (index === 0) return;
                    const order = [...data.section_order];
                    [order[index - 1], order[index]] = [order[index], order[index - 1]];
                    setField("section_order", order);
                  }} disabled={index === 0} aria-label={`Move ${section} up`}>↑</button>
                  <button type="button" onClick={() => {
                    if (index === data.section_order.length - 1) return;
                    const order = [...data.section_order];
                    [order[index + 1], order[index]] = [order[index], order[index + 1]];
                    setField("section_order", order);
                  }} disabled={index === data.section_order.length - 1} aria-label={`Move ${section} down`}>↓</button>
                </div>
              </div>
            ))}</div>
          </div>
          <div className="motion-note"><span>✦</span><label><input type="checkbox" checked={reduceMotion} onChange={(event) => setReduceMotion(event.target.checked)} /> Reduce motion</label></div>
        </aside>
      </main>
      <footer className="page-footer"><span>RESUME BUILDER</span><span>Clear words. Real work. Your next step.</span><button type="button" onClick={() => window.print()}>Download PDF <span>↓</span></button></footer>
    </div>
  );
}

function SkillAdder({ category, onAdd }) {
  const [value, setValue] = useState("");
  const submit = (event) => {
    event.preventDefault();
    const name = value.trim();
    if (!name) return;
    onAdd(name);
    setValue("");
  };
  return <form className="skill-adder" onSubmit={submit}><input aria-label={`Add skill to ${category}`} value={value} onChange={(event) => setValue(event.target.value)} placeholder="+ Add skill" /><button type="submit" aria-label={`Add skill to ${category}`}>+</button></form>;
}

export default App;
