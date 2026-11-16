# Resume Builder

A responsive resume editor with a live, single-column ATS-friendly preview, confirmed keyword suggestions, database-backed resume CRUD, and print-to-PDF export. The summary draft is generated only from details you entered; it does not call an AI service or invent qualifications.

## Architecture

- `frontend/`: React + Vite editor and preview; the browser's print dialog can save the resume as PDF.
- `backend/`: FastAPI REST API, Pydantic validation, and SQLAlchemy models for resumes and their sections.
- SQLite is the local default. Set `DATABASE_URL` to a PostgreSQL SQLAlchemy URL to use PostgreSQL.

## Requirements

- Node.js 18+ and npm
- Python 3.10+

## Run locally

1. Copy `.env.example` to `.env` in the project root and adjust values if needed.
2. Start the API:

   ```powershell
   cd backend
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

   Tables are initialized on startup. The default SQLite database is `backend/resume_builder.db`. For PostgreSQL, use a URL such as `postgresql+psycopg://user:password@localhost:5432/resume_builder`.

3. In a second terminal, start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   Visit the Vite URL (usually http://localhost:5173). Vite reads the root `.env`; set `VITE_API_URL` there to point to a different API URL.

## Tests

```powershell
cd backend
py -m pip install -r requirements.txt
py -m pytest
```

The API is documented at http://localhost:8000/docs while the backend is running.

## Privacy and limitations

There is no sign-in or multi-user account system in this starter; do not expose its API publicly without adding authentication and access controls. Resume records are stored in the configured SQL database. The sample profile is opt-in and is never prefilled automatically. PDF export opens the browser print dialog; select “Save as PDF”.

The ATS checklist is an estimate of completeness and plain formatting, not a hiring outcome or promised score. Missing keywords are suggestions only and are never added to resume claims unless the user confirms them.
