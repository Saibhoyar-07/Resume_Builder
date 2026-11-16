import React from "react";

const dateLabel = (value) => {
  if (!value) return "";
  const [year, month] = value.split("-");
  if (!month) return value;
  return `${new Date(Number(year), Number(month) - 1).toLocaleString("en", { month: "short" })} ${year}`;
};

function Dates({ start, end, current, separator = " – " }) {
  const from = dateLabel(start);
  const to = current ? "Present" : dateLabel(end);
  return from || to ? <span>{[from, to].filter(Boolean).join(separator)}</span> : null;
}

function ResumeSection({ title, children }) {
  return (
    <section className="resume-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export default function ResumePreview({ data }) {
  const skillGroups = data.skills.reduce((groups, skill) => {
    if (!skill.name.trim()) return groups;
    groups[skill.category] = [...(groups[skill.category] || []), skill.name.trim()];
    return groups;
  }, {});

  const sectionContent = {
    experience: data.experience.some((entry) => entry.title || entry.company) && (
      <ResumeSection title="Experience">
        {data.experience.filter((entry) => entry.title || entry.company).map((entry, index) => (
          <div className="resume-entry" key={index}>
            <div className="resume-entry-head">
              <strong>{entry.title}</strong>
              <Dates start={entry.start_date} end={entry.end_date} current={entry.current} />
            </div>
            <div className="resume-entry-sub">{[entry.company, data.location].filter(Boolean).join(" · ")}</div>
            {entry.description && <p>{entry.description}</p>}
            {entry.bullets.filter(Boolean).length > 0 && <ul>{entry.bullets.filter(Boolean).map((bullet, i) => <li key={i}>{bullet}</li>)}</ul>}
          </div>
        ))}
      </ResumeSection>
    ),
    projects: data.projects.some((item) => item.name) && (
      <ResumeSection title="Projects">
        {data.projects.filter((item) => item.name).map((item, index) => (
          <div className="resume-entry" key={index}>
            <div className="resume-entry-head">
              <strong>{item.name}</strong>
              {(item.dates || item.link) && <span>{[item.dates, item.link].filter(Boolean).join(" · ")}</span>}
            </div>
            {item.technologies && <div className="resume-entry-sub">{item.technologies}</div>}
            {item.description && <p>{item.description}</p>}
            {item.bullets.filter(Boolean).length > 0 && <ul>{item.bullets.filter(Boolean).map((bullet, i) => <li key={i}>{bullet}</li>)}</ul>}
          </div>
        ))}
      </ResumeSection>
    ),
    education: data.education.some((item) => item.degree || item.institution) && (
      <ResumeSection title="Education">
        {data.education.filter((item) => item.degree || item.institution).map((item, index) => (
          <div className="resume-entry" key={index}>
            <div className="resume-entry-head">
              <strong>{item.degree}</strong>
              <span>{[item.start_year, item.end_year].filter(Boolean).join(" – ")}</span>
            </div>
            <div className="resume-entry-sub">{item.institution}</div>
            {item.grade && <p>{item.grade}</p>}
            {item.coursework && <p>Relevant coursework: {item.coursework}</p>}
          </div>
        ))}
      </ResumeSection>
    ),
    skills: Object.keys(skillGroups).length > 0 && (
      <ResumeSection title="Technical Skills">
        <div className="resume-skills">
          {Object.entries(skillGroups).map(([category, skills]) => (
            <p key={category}><strong>{category}:</strong> {skills.join(", ")}</p>
          ))}
        </div>
      </ResumeSection>
    ),
    certifications: (data.certifications.some((item) => item.name) || data.achievements.some((item) => item.name)) && (
      <ResumeSection title="Certifications & Achievements">
        <ul className="compact-list">
          {data.certifications.filter((item) => item.name).map((item, index) => (
            <li key={`cert-${index}`}><strong>{item.name}</strong>{[item.organization, item.date].filter(Boolean).length > 0 && ` — ${[item.organization, item.date].filter(Boolean).join(", ")}`}</li>
          ))}
          {data.achievements.filter((item) => item.name).map((item, index) => (
            <li key={`achievement-${index}`}><strong>{item.name}</strong>{[item.organization, item.date].filter(Boolean).length > 0 && ` — ${[item.organization, item.date].filter(Boolean).join(", ")}`}</li>
          ))}
        </ul>
      </ResumeSection>
    ),
    achievements: data.achievements.some((item) => item.name) && (
      <ResumeSection title="Achievements">
        <ul className="compact-list">
          {data.achievements.filter((item) => item.name).map((item, index) => (
            <li key={index}><strong>{item.name}</strong>{[item.organization, item.date].filter(Boolean).length > 0 && ` — ${[item.organization, item.date].filter(Boolean).join(", ")}`}</li>
          ))}
        </ul>
      </ResumeSection>
    ),
  };

  const contacts = [
    data.email,
    data.phone,
    data.location,
    data.linkedin,
    data.github,
    data.portfolio,
  ].filter(Boolean);

  return (
    <article className={`resume-paper template-${data.template}`} aria-label="Live resume preview">
      {(data.full_name || data.target_title || contacts.length > 0) ? (
        <header className="resume-header">
          <h1>{data.full_name || "Your Name"}</h1>
          {data.target_title && <div className="resume-target">{data.target_title}</div>}
          <div className="resume-contact">{contacts.map((item, index) => (
            <React.Fragment key={item}>{index > 0 && <span className="contact-divider"> | </span>}{item}</React.Fragment>
          ))}</div>
        </header>
      ) : <div className="resume-empty">Your resume will take shape here as you add your details.</div>}

      {data.summary && <ResumeSection title="Professional Summary"><p>{data.summary}</p></ResumeSection>}
      {data.section_order.map((section) => sectionContent[section] ? <React.Fragment key={section}>{sectionContent[section]}</React.Fragment> : null)}
    </article>
  );
}
