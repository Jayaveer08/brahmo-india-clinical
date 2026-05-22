# Architecture Notes

## Design goal

The system proves Option C by loading Indian clinical context before the doctor asks a question. The same tables, safety engine, and prompt composer serve diabetes, cardiovascular disease, CKD, heart failure, ACS, AF, and overlap patients.

## Unified data model

There are no condition-specific tables.

- `drugs`: all diabetes and cardiovascular drugs, tagged with `condition_tags`.
- `drug_interactions`: all DDI pairs, including cross-condition pairs such as glimepiride plus beta-blocker and ramipril plus spironolactone.
- `indian_guidelines`: all guideline nodes from RSSDI, CSI, IHRS, MoHFW, and NLEM-related context.
- `hospital_formulary`: site availability for Apollo Chennai.

Adding asthma/COPD would mean adding Indian Chest Society guideline rows, inhaler drug rows, respiratory interactions, and formulary rows. The safety engine can consume those tags without new tables.

## Runtime flow

1. Select or receive a patient profile.
2. Normalize current medications and match them to `drugs`.
3. Pull guideline rows whose tags overlap with patient tags.
4. Run safety checks:
   - CKD stage from eGFR.
   - Renal dosing warnings.
   - HF contraindications.
   - Cross-condition DDI checks.
   - Potassium checks for RAAS inhibitor plus MRA.
   - CHA2DS2-VASc for AF.
   - STEMI emergency pathway activation.
5. Compose an India-specific context block:
   - RSSDI for diabetes.
   - CSI/IHRS for cardiology.
   - Indian brands and INR prices.
   - NLEM status and affordability.
   - Apollo Chennai contacts.
6. Show the contrast against a generic AI answer.

## Files

- `src/clinical-data.ts`: demo data mirror of the Supabase rows.
- `src/safety-engine.ts`: safety rules and prompt context selection.
- `src/App.tsx`: patient selector, response comparison, alerts, guideline and formulary panels.
- `supabase/schema.sql`: production-style unified schema.
- `supabase/seed.sql`: seed subset matching the demo knowledge base.

## Safety boundary

This is a clinical decision-support demo, not autonomous prescribing. The UI is designed to surface local context, contraindications, and guideline anchors for a doctor to review.
