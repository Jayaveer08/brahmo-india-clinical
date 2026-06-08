# BRAHMO India Clinical AI

Clinical AI context assembly demo for Indian doctors, covering Type 2 Diabetes Mellitus and Cardiovascular Disease. The system pre-loads patient-specific context, Indian guidelines, drug brands, prices, renal dosing, contraindications, and interaction checks before the doctor asks a question.

This is an Option C assessment build for BRAHMO / Astroum AI.

## Features

- Dashboard for clinical overview and high-risk patients.
- Patient registry with search, add, edit, delete, and profile details.
- Patient detail view with:
  - AI Clinical Assistant
  - Patient Info
  - Raw assembled context prompt
- Patient-specific AI answers based on profile, labs, medicines, and risk.
- Indian drug reference with brands, prices, renal dosing, HF safety, NLEM status, and interactions.
- Clinical guidelines for T2DM and cardiovascular disease.
- Lab result form with AI Lab Report Scanner UI.
- Export reports as CSV or PDF.
- Local persistence using browser localStorage.
- Supabase schema and seed files for production-style data storage.

## Tech Stack

- React
- TypeScript
- Vite
- Supabase-ready SQL schema
- Local clinical data mirror for reliable offline demo

## Local Setup

Install dependencies:

```powershell
npm.cmd install
```

Create environment file:

```powershell
copy .env.local.example .env.local
```

Add your Supabase values inside `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_LLM_API_KEY=
```

`VITE_LLM_API_KEY` is optional. The demo works without it because the clinical assistant has a local response engine.

Run the app:

```powershell
npm.cmd run dev
```

Open the URL printed by Vite, usually:

```text
http://localhost:5173
```

## Build

```powershell
npm.cmd run build
```

## Supabase Setup

1. Go to `supabase.com` and create a project named `brahmo-india-clinical`.
2. Go to `Settings -> API`.
3. Copy the project URL and anon key into `.env.local`.
4. Open `SQL Editor`.
5. Run:

```text
supabase/schema.sql
```

6. Then run:

```text
supabase/seed.sql
```

The current demo uses `src/clinical-data.ts` for fast and reliable local operation. The Supabase schema mirrors the same knowledge model and can be connected to live queries later.

## Data Model

The design uses one reusable clinical knowledge structure instead of disease-specific hardcoding.

- `drugs`: Indian generic and brand medicines, prices, renal dosing, HF safety, NLEM status.
- `drug_interactions`: diabetes and cardiovascular interaction rules.
- `indian_guidelines`: RSSDI, CSI, ICMR, API, and related Indian clinical guidance.
- `hospital_formulary`: availability and local formulary notes.

Adding a new specialty should require adding data rows, not redesigning the app.

## Demo Flow

1. Open the dashboard and show the India clinical context engine.
2. Open patient profiles and select a diabetes + cardiovascular overlap case.
3. Show `Patient Info` and `Raw Context` to demonstrate pre-loaded context.
4. Ask the AI Clinical Assistant:
   - What treatment changes would you recommend?
   - Is the current medication regimen appropriate?
   - What monitoring should I prioritize?
   - Are there any drug interactions I should be aware of?
5. Open Drug Reference and show Indian brands, prices, renal dosing, and interactions.
6. Open Guidelines and switch between Type 2 Diabetes and Cardiovascular tabs.
7. Add or edit a patient and show that context updates.
8. Export patient data or guidelines as CSV/PDF.

## Important Files

- `src/App.tsx`: main app, routes, forms, assistant UI, exports.
- `src/clinical-data.ts`: Indian clinical data used by the local demo.
- `src/safety-engine.ts`: guideline matching, drug recommendations, safety alerts.
- `supabase/schema.sql`: Supabase table schema.
- `supabase/seed.sql`: starter database seed.
- `docs/architecture.md`: architecture notes.
- `docs/data_sources.md`: clinical data source notes.

## Security

Do not commit `.env.local`.


## Clinical Disclaimer

This is a clinical decision-support demo. It does not replace physician judgment. Final prescribing and monitoring decisions rest with the treating clinician.
