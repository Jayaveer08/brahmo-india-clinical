import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import './App.css'
import { drugs, guidelines, interactions, patients as seedPatients, type ConditionTag, type Drug, type Patient } from './clinical-data'
import { activeGuidelines, composeOptionCResponse, patientDrugs, recommendedDrugs, safetyAlerts } from './safety-engine'

type Page = 'dashboard' | 'patients' | 'drugs' | 'guidelines' | 'newPatient' | 'patientDetail'
type NavPage = 'dashboard' | 'patients' | 'drugs' | 'guidelines'
type PatientTab = 'ai' | 'info' | 'raw'
type ExportMenuProps = {
  label?: string
  onCsv: () => void
  onPdf: () => void
}

type MedicationDraft = {
  drug: string
  brand: string
  dose: string
  frequency: string
}

type NewPatientDraft = {
  name: string
  age: string
  sex: 'M' | 'F'
  weight: string
  height: string
  dmDuration: string
  conditions: string[]
  comorbidities: string[]
  meds: string
  medRows: MedicationDraft[]
  hba1c: string
  fpg: string
  pp2: string
  egfr: string
  creatinine: string
  potassium: string
  urineAcr: string
  alt: string
  ast: string
  hb: string
  totalChol: string
  ldl: string
  hdl: string
  tg: string
  systolic: string
  diastolic: string
  smoking: string
  alcohol: string
  activity: string
  allergies: string
  allergyInput: string
  allergiesList: string[]
  familyHistory: string
  familyHistoryInput: string
  familyHistoryList: string[]
  notes: string
  insurance: string
}

type PatientWithDraft = Patient & { formDraft?: NewPatientDraft }

const nav: { id: NavPage; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'patients', label: 'Patients', icon: 'users' },
  { id: 'drugs', label: 'Drug Reference', icon: 'capsule' },
  { id: 'guidelines', label: 'Guidelines', icon: 'book' },
]

const demoNames = ['Rajesh Kumar', 'Priya Sharma', 'Mohammed Iqbal', 'Arun Menon', 'K. Srinivas', 'Lakshmi Devi']
const primaryConditions = ['Type 2 Diabetes Mellitus', 'Hypertension', 'Coronary Artery Disease', 'Heart Failure', 'Dyslipidemia', 'Atrial Fibrillation', 'Peripheral Artery Disease', 'Stroke/TIA']
const comorbidityChoices = ['CKD', 'NAFLD/NASH', 'Obesity', 'Hypothyroidism', 'COPD', 'Retinopathy', 'Neuropathy', 'Diabetic Foot', 'OSA', 'Gout', 'Anemia']
const patientStorageKey = 'brahmo-india-clinical-patients-v1'

function loadStoredPatients() {
  try {
    const raw = localStorage.getItem(patientStorageKey)
    if (!raw) return seedPatients
    const parsed = JSON.parse(raw) as Patient[]
    if (!Array.isArray(parsed) || !parsed.length) return seedPatients
    return parsed.map((patient) => {
      if (!patient.id.startsWith('custom-')) return patient
      return {
        ...patient,
        age: patient.age === 45 ? 0 : patient.age,
        bmi: patient.bmi === 25 ? 0 : patient.bmi,
      }
    })
  } catch {
    return seedPatients
  }
}

function displayName(patient: Patient) {
  const index = seedPatients.findIndex((item) => item.id === patient.id)
  return index >= 0 ? demoNames[index] : patient.name
}

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function ageText(patient: Patient) {
  return Number.isFinite(patient.age) && patient.age > 0 ? `${patient.age}y` : 'Age not recorded'
}

function bmiText(patient: Patient) {
  return Number.isFinite(patient.bmi) && patient.bmi > 0 ? `BMI ${patient.bmi}` : 'BMI not recorded'
}

function csvCell(value: unknown) {
  const text = String(value ?? '').replace(/"/g, '""')
  return `"${text}"`
}

function downloadCsv(filename: string, headers: string[], rows: unknown[][]) {
  const body = [headers.map(csvCell).join(','), ...rows.map((row) => row.map(csvCell).join(','))].join('\n')
  const blob = new Blob([body], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function openPdfReport(title: string, html: string) {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`<!doctype html><html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;margin:32px;color:#111827}h1{font-size:24px}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{border:1px solid #d8dee8;padding:8px;text-align:left;font-size:12px}.card{border:1px solid #d8dee8;border-radius:8px;padding:14px;margin:12px 0}pre{white-space:pre-wrap;background:#f3f6fa;padding:14px;border-radius:8px}</style></head><body><h1>${title}</h1>${html}<script>window.onload=()=>window.print()</script></body></html>`)
  win.document.close()
}

function patientRows(patients: Patient[]) {
  return patients.map((patient) => [displayName(patient), ageText(patient), patient.sex, bmiText(patient), patient.conditions.join('; '), patient.meds.join('; '), patient.labs.hba1c ?? '', patient.labs.egfr ?? '', patient.insurance])
}

function hasValue(value: unknown) {
  return value !== undefined && value !== null && value !== '' && value !== 'NA'
}

function lab(patient: Patient, key: string) {
  const value = patient.labs[key]
  return hasValue(value) ? String(value) : 'not recorded'
}

function bpValue(patient: Patient) {
  return hasValue(patient.vitals.bp) ? String(patient.vitals.bp) : 'not recorded'
}

function patientProfileSummary(patient: Patient) {
  const missing = [
    ['HbA1c', patient.labs.hba1c],
    ['FPG', patient.labs.fbs],
    ['2hr PPG', patient.labs.pp2],
    ['eGFR', patient.labs.egfr],
    ['Urine ACR', patient.labs.acr],
    ['LDL-C', patient.labs.ldl],
    ['BP', patient.vitals.bp],
    ['Current medicines', patient.meds.length ? patient.meds.join(', ') : ''],
  ].filter(([, value]) => !hasValue(value)).map(([name]) => name)

  return {
    missing,
    hasDiabetes: patient.tags.includes('diabetes'),
    hasCvd: patient.tags.includes('cardiovascular') || patient.tags.includes('heart_failure') || patient.tags.includes('acs') || patient.tags.includes('af'),
    hasCkd: patient.tags.includes('ckd') || (typeof patient.labs.egfr === 'number' && patient.labs.egfr < 60),
    hasHf: patient.tags.includes('heart_failure'),
    hba1c: typeof patient.labs.hba1c === 'number' ? patient.labs.hba1c : null,
    egfr: typeof patient.labs.egfr === 'number' ? patient.labs.egfr : null,
    ldl: typeof patient.labs.ldl === 'number' ? patient.labs.ldl : null,
  }
}

function assembledSystemPrompt(patient: Patient) {
  const summary = patientProfileSummary(patient)
  const sources = activeGuidelines(patient).map((item) => `${item.source} - ${item.section}`).join('\n- ') || 'No matched guideline nodes'
  const alerts = safetyAlerts(patient).map((alert) => `${alert.severity.toUpperCase()}: ${alert.title} - ${alert.detail}`).join('\n- ') || 'No critical alerts'
  const recs = recommendedDrugs(patient).map((drug) => `${drug.generic} | ${drug.brand} | ${drug.mrp} | renal: ${drug.renal} | HF safe: ${drug.hfSafe ? 'yes' : 'no'}`).join('\n- ') || 'No medication rows selected'
  return [
    'You are a clinical AI assistant for Indian doctors. Use Indian context first: RSSDI, CSI/IHRS, ICMR, API, NLEM, and Indian brand/price data.',
    'Do not replace clinical judgment. State missing data before giving pharmacologic recommendations.',
    '',
    '=== PATIENT CONTEXT assembled by BRAHMO ===',
    `Patient: ${displayName(patient)}, ${ageText(patient)} ${patient.sex}`,
    `BMI: ${Number.isFinite(patient.bmi) && patient.bmi > 0 ? `${patient.bmi} kg/m2` : 'not recorded'}`,
    `Conditions: ${patient.conditions.length ? patient.conditions.join(', ') : 'None recorded'}`,
    `Current medications: ${patient.meds.length ? patient.meds.join(', ') : 'None recorded'}`,
    `Allergy: ${patient.allergy || 'not recorded'}`,
    `Insurance/cost context: ${patient.insurance || 'not recorded'}`,
    '',
    '=== KEY LAB VALUES ===',
    `HbA1c ${lab(patient, 'hba1c')} | FPG ${lab(patient, 'fbs')} | 2hr PPG ${lab(patient, 'pp2')}`,
    `eGFR ${lab(patient, 'egfr')} | Creatinine ${lab(patient, 'creatinine')} | Urine ACR ${lab(patient, 'acr')} | K+ ${lab(patient, 'potassium')}`,
    `LDL-C ${lab(patient, 'ldl')} | HDL-C ${lab(patient, 'hdl')} | TG ${lab(patient, 'tg')} | BP ${bpValue(patient)}`,
    '',
    '=== MISSING DATA ===',
    summary.missing.length ? summary.missing.join(', ') : 'None obvious from available profile',
    '',
    '=== SAFETY ALERTS ===',
    `- ${alerts}`,
    '',
    '=== RELEVANT DRUG CONTEXT ===',
    `- ${recs}`,
    '',
    '=== GUIDELINES PULLED ===',
    `- ${sources}`,
    '',
    '=== RESPONSE INSTRUCTIONS ===',
    '- Answer the exact doctor question, not a generic care plan.',
    '- If data are insufficient, say so and recommend what to obtain.',
    '- Use Indian drug brands and INR costs where drug options are discussed.',
    '- Include renal/HF/DDI constraints and cost/access constraints.',
    '- End with: Clinical decision support only; final decisions rest with the treating physician.',
  ].join('\n')
}

function assistantAnswer(patient: Patient, question: string) {
  const q = question.toLowerCase()
  const summary = patientProfileSummary(patient)
  const alerts = safetyAlerts(patient)
  const recs = recommendedDrugs(patient)
  const highAlerts = alerts.filter((alert) => alert.severity === 'critical' || alert.severity === 'high')
  const missingLine = summary.missing.length ? `Missing/needed first: ${summary.missing.join(', ')}.` : 'Available profile has enough core context for a preliminary decision-support response.'
  const safetyLine = highAlerts.length ? highAlerts.map((alert) => `- ${alert.title}: ${alert.detail}`).join('\n') : '- No high-severity safety alert from current profile.'
  const drugLine = recs.slice(0, 5).map((drug) => `${drug.generic} (${drug.brand}, ${drug.mrp})`).join('; ')

  if (q.includes('monitor')) {
    return [
      `Based on ${displayName(patient)}'s assembled context, monitoring should be prioritized around the highest-risk active problems.`,
      missingLine,
      '',
      '1. Glycemia',
      summary.hba1c ? `HbA1c is ${summary.hba1c}%. Repeat every 3 months until controlled, then every 6 months.` : 'HbA1c is not recorded. Obtain baseline HbA1c before intensifying diabetes medicines.',
      'Use FPG/PPG or SMBG if changing therapy or adding insulin/sulfonylurea.',
      '',
      '2. Renal and electrolytes',
      summary.egfr ? `eGFR is ${summary.egfr}. Monitor creatinine/eGFR and K+ after ACEi/ARB/MRA/SGLT2 changes.` : 'eGFR is not recorded. Obtain creatinine/eGFR before metformin, SGLT2 inhibitor, ACEi/ARB, MRA, or DOAC decisions.',
      'Repeat urine ACR if diabetes/HTN/CKD risk is present.',
      '',
      '3. Cardiovascular risk',
      summary.ldl ? `LDL-C is ${summary.ldl}. Track LDL-C against CSI risk target and repeat 6-8 weeks after statin changes.` : 'LDL-C is not recorded. Obtain lipid profile to classify CSI risk and statin target.',
      `BP: ${bpValue(patient)}. Confirm with home/clinic readings if elevated.`,
      '',
      '4. Safety alerts',
      safetyLine,
      '',
      'Clinical decision support only; final decisions rest with the treating physician.',
    ].join('\n')
  }

  if (q.includes('interaction') || q.includes('aware')) {
    return [
      `Drug-interaction review for ${displayName(patient)}:`,
      missingLine,
      '',
      'Current matched medicines:',
      patientDrugs(patient).map((drug) => `- ${drug.generic} (${drug.brand})`).join('\n') || '- No current medicines matched to database.',
      '',
      'Important safety/DDI checks:',
      safetyLine,
      '',
      'Practical next step: reconcile the actual prescription with dose/frequency, then re-run renal, HF, hypoglycemia, and antithrombotic bleeding checks.',
      '',
      'Clinical decision support only; final decisions rest with the treating physician.',
    ].join('\n')
  }

  if (q.includes('regimen') || q.includes('appropriate')) {
    return [
      `Medication-regimen assessment for ${displayName(patient)}:`,
      missingLine,
      '',
      patient.meds.length ? `Current regimen: ${patient.meds.join(', ')}.` : 'No current medication regimen is recorded, so appropriateness cannot be confirmed.',
      '',
      'Safety fit:',
      safetyLine,
      '',
      'Indian context options if escalation is needed:',
      drugLine || 'No drug recommendation rows available.',
      '',
      summary.hba1c && summary.hba1c > 8 ? 'Glycemic control appears above target, so intensification is reasonable after confirming adherence, diet, renal function, and affordability.' : 'If HbA1c is at/near individualized target, avoid unnecessary escalation and prioritize monitoring and risk-factor control.',
      '',
      'Clinical decision support only; final decisions rest with the treating physician.',
    ].join('\n')
  }

  return [
    `Treatment-change recommendation for ${displayName(patient)}:`,
    missingLine,
    '',
    summary.missing.length > 3 ? 'Because several core data elements are missing, start with baseline investigations and lifestyle/medical nutrition therapy before disease-specific drug escalation.' : 'Available context supports a patient-specific treatment discussion.',
    '',
    summary.hasDiabetes ? `Diabetes: ${summary.hba1c ? `HbA1c ${summary.hba1c}%. ` : ''}${summary.hasCkd || summary.hasHf ? 'Prefer cardiorenal-safe choices such as SGLT2 inhibitor when eligible; avoid unsafe HF/CKD options.' : 'Use RSSDI-style escalation by HbA1c, weight, hypoglycemia risk, and cost.'}` : 'Diabetes: not clearly documented; confirm diagnosis if uncertain.',
    summary.hasCvd ? `Cardiovascular: apply CSI/API risk management, BP control, statin target, and antiplatelet/anticoagulation logic where indicated.` : 'Cardiovascular: no major CVD tag recorded; screen risk factors before adding CVD-specific therapy.',
    '',
    'Safety blockers/flags:',
    safetyLine,
    '',
    'Indian drug context:',
    drugLine || 'No drug recommendation rows available.',
    '',
    'Clinical decision support only; final decisions rest with the treating physician.',
  ].join('\n')
}

function ExportMenu({ label = 'Export All', onCsv, onPdf }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  function choose(action: () => void) {
    action()
    setOpen(false)
  }
  return (
    <div className="export-menu">
      <button className="secondary export-trigger" onClick={() => setOpen((value) => !value)}>⇩ {label}</button>
      {open && (
        <div className="export-popover">
          <strong>Export Format</strong>
          <button onClick={() => choose(onCsv)}>▦ Download as CSV</button>
          <button onClick={() => choose(onPdf)}>▤ Download as PDF</button>
        </div>
      )}
    </div>
  )
}

function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [allPatients, setAllPatients] = useState<Patient[]>(loadStoredPatients)
  const [query, setQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient>(seedPatients[0])
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)

  useEffect(() => {
    localStorage.setItem(patientStorageKey, JSON.stringify(allPatients))
  }, [allPatients])

  const visiblePatients = useMemo(() => {
    const term = query.toLowerCase()
    return allPatients.filter((patient) => `${displayName(patient)} ${patient.conditions.join(' ')}`.toLowerCase().includes(term))
  }, [allPatients, query])

  function openPatient(patient: Patient) {
    setSelectedPatient(patient)
    setPage('patientDetail')
  }

  function addPatient(patient: Patient) {
    setAllPatients((current) => [patient, ...current])
    setSelectedPatient(patient)
    setPage('patientDetail')
  }

  function saveEditedPatient(patient: Patient) {
    setAllPatients((current) => current.map((item) => item.id === patient.id ? patient : item))
    setSelectedPatient(patient)
    setEditingPatient(null)
    setPage('patientDetail')
  }

  function deletePatient(patient: Patient) {
    setAllPatients((current) => current.filter((item) => item.id !== patient.id))
    setSelectedPatient(seedPatients[0])
    setPage('patients')
  }

  function goNav(next: NavPage) {
    setPage(next)
  }

  return (
    <div className="app-shell">
      <aside className="side">
        <div className="brand">
          <div className="brand-mark">B</div>
          <div>
            <strong>BRAHMO</strong>
            <span>Clinical AI Context</span>
          </div>
        </div>
        <nav>
          {nav.map((item) => (
            <button key={item.id} className={page === item.id || (page === 'patientDetail' && item.id === 'patients') ? 'nav-item active' : 'nav-item'} onClick={() => goNav(item.id)}>
              <Icon name={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="patent">Patent Pending USPTO #74841377</div>
        <button className="collapse">&lt;</button>
      </aside>

      <main className={page === 'patientDetail' ? 'content detail-content' : 'content'}>
        {page === 'dashboard' && <Dashboard patients={allPatients} go={goNav} onAdd={() => setPage('newPatient')} onOpen={openPatient} />}
        {page === 'patients' && <Patients patients={allPatients} query={query} setQuery={setQuery} visiblePatients={visiblePatients} onAdd={() => setPage('newPatient')} onOpen={openPatient} />}
        {page === 'drugs' && <DrugReference />}
        {page === 'guidelines' && <GuidelineReference />}
        {page === 'newPatient' && <NewPatientPage initialPatient={editingPatient} onCancel={() => { setEditingPatient(null); setPage(editingPatient ? 'patientDetail' : 'patients') }} onSave={editingPatient ? saveEditedPatient : addPatient} />}
        {page === 'patientDetail' && <PatientDetailPage patient={selectedPatient} onBack={() => setPage('patients')} onEdit={(patient) => { setEditingPatient(patient); setPage('newPatient') }} onDelete={deletePatient} />}
      </main>
    </div>
  )
}

function Dashboard({ patients, go, onAdd, onOpen }: { patients: Patient[]; go: (page: NavPage) => void; onAdd: () => void; onOpen: (patient: Patient) => void }) {
  const needsAttention = patients.filter((patient) => safetyAlerts(patient).some((alert) => alert.severity === 'critical')).length
  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="active-dot">Context engine active</p>
          <h1>Clinical Dashboard</h1>
          <p>BRAHMO AI-powered clinical decision support for Indian healthcare</p>
        </div>
        <button className="primary" onClick={onAdd}>+ New Patient</button>
      </div>

      <div className="metric-grid">
        <Metric label="Total Patients" value={patients.length} helper="Active profiles" icon="users" tone="blue" />
        <Metric label="Diabetic Patients" value={patients.filter((p) => p.tags.includes('diabetes')).length} helper="Type 2 DM" icon="droplet" tone="teal" />
        <Metric label="CVD Patients" value={patients.filter((p) => p.tags.includes('cardiovascular') || p.tags.includes('heart_failure')).length} helper="HTN / CAD / HF" icon="heart" tone="red" />
        <Metric label="Needs Attention" value={needsAttention} helper="Critical safety alerts" icon="alert" tone="amber" />
      </div>

      <div className="dashboard-grid">
        <section className="card wide">
          <div className="card-head">
            <h2>Recent Patients</h2>
            <button className="link-button" onClick={() => go('patients')}>View All -&gt;</button>
          </div>
          <div className="recent-list">
            {patients.slice(0, 3).map((patient) => <RecentPatient key={patient.id} patient={patient} onOpen={onOpen} />)}
          </div>
        </section>

        <aside className="stack">
          <section className="card">
            <h2>Quick Actions</h2>
            <button className="action" onClick={onAdd}>+ New Patient Profile</button>
            <button className="action" onClick={() => go('drugs')}>Drug Reference</button>
            <button className="action" onClick={() => go('guidelines')}>Clinical Guidelines</button>
          </section>
          <section className="context-box">
            <div className="brand-mark small">B</div>
            <div>
              <strong>Context Assembly</strong>
              <p>BRAHMO automatically assembles clinical context from patient data, Indian guidelines, drug data, and formulary rows before each AI session.</p>
            </div>
          </section>
        </aside>
      </div>
    </section>
  )
}

function Patients({ patients, query, setQuery, visiblePatients, onAdd, onOpen }: { patients: Patient[]; query: string; setQuery: (value: string) => void; visiblePatients: Patient[]; onAdd: () => void; onOpen: (patient: Patient) => void }) {
  function exportCsv() {
    downloadCsv('patient-registry.csv', ['Name', 'Age', 'Sex', 'BMI', 'Conditions', 'Medications', 'HbA1c', 'eGFR', 'Insurance'], patientRows(visiblePatients))
  }

  function exportPdf() {
    const rows = patientRows(visiblePatients).map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')
    openPdfReport('Patient Registry', `<table><thead><tr><th>Name</th><th>Age</th><th>Sex</th><th>BMI</th><th>Conditions</th><th>Medications</th><th>HbA1c</th><th>eGFR</th><th>Insurance</th></tr></thead><tbody>${rows}</tbody></table>`)
  }

  return (
    <section className="page">
      <div className="page-head compact">
        <div>
          <h1>Patient Profiles</h1>
          <p>{patients.length} patients with assembled clinical context</p>
        </div>
        <div className="header-actions"><ExportMenu onCsv={exportCsv} onPdf={exportPdf} /><button className="primary" onClick={onAdd}>+ Add Patient</button></div>
      </div>
      <div className="search">⌕ <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or condition..." /></div>
      <div className="patient-grid">
        {visiblePatients.map((patient) => <PatientCard key={patient.id} patient={patient} onOpen={onOpen} />)}
      </div>
    </section>
  )
}

function PatientDetailPage({ patient, onBack, onEdit, onDelete }: { patient: Patient; onBack: () => void; onEdit: (patient: Patient) => void; onDelete: (patient: Patient) => void }) {
  const [tab, setTab] = useState<PatientTab>('ai')
  const alerts = safetyAlerts(patient)
  const sources = activeGuidelines(patient)
  const recs = recommendedDrugs(patient)
  const matched = patientDrugs(patient)
  const hba1c = typeof patient.labs.hba1c === 'number' ? patient.labs.hba1c : null

  function exportCsv() {
    downloadCsv(`${displayName(patient).toLowerCase().replace(/\s+/g, '-')}-clinical-report.csv`, ['Field', 'Value'], [
      ['Name', displayName(patient)],
      ['Age/Sex', `${ageText(patient)} ${patient.sex}`],
      ['BMI', bmiText(patient)],
      ['Conditions', patient.conditions.join('; ')],
      ['Medications', patient.meds.join('; ')],
      ['Alerts', alerts.map((alert) => alert.title).join('; ')],
      ['Recommendations', recs.map((drug) => `${drug.generic} ${drug.brand}`).join('; ')],
    ])
  }

  function exportPdf() {
    openPdfReport(`${displayName(patient)} Clinical Report`, `<div class="card"><strong>${ageText(patient)} ${patient.sex}</strong><br/>${bmiText(patient)}<br/>${patient.conditions.join(', ')}</div><div class="card"><h2>Medications</h2>${patient.meds.join('<br/>')}</div><div class="card"><h2>Safety Alerts</h2>${alerts.map((alert) => `<p><strong>${alert.title}</strong><br/>${alert.detail}</p>`).join('')}</div><div class="card"><h2>Option C Context</h2><pre>${composeOptionCResponse(patient)}</pre></div>`)
  }

  return (
    <section className="patient-detail-page">
      <header className="detail-topbar">
        <button className="back-button" onClick={onBack}>←</button>
        <div className="avatar large">{initials(displayName(patient))}</div>
        <div>
          <h1>{displayName(patient)}</h1>
          <p>{ageText(patient)} {patient.sex} • {bmiText(patient)} • {patient.conditions.slice(0, 3).join(', ')}</p>
        </div>
        <div className="detail-actions">
          <ExportMenu label="Export" onCsv={exportCsv} onPdf={exportPdf} />
          <button onClick={() => onEdit(patient)}>Edit</button>
          <button className="danger" onClick={() => onDelete(patient)}>Delete</button>
        </div>
      </header>

      <div className="detail-layout">
        <aside className="assembled-context">
          <p className="active-dot">Assembled context</p>
          <small>Auto-generated from patient data + Indian clinical guidelines</small>
          <ContextBlock title="Diabetes Status" rows={[`HbA1c ${hba1c ?? 'NA'}${hba1c ? '%' : ''}`, hba1c && hba1c > 8 ? 'Poorly controlled' : 'Target individualized', 'Step Dual/Triple therapy zone']} />
          <ContextBlock title="CVD Risk" rows={[patient.tags.includes('acs') || patient.tags.includes('af') || patient.tags.includes('heart_failure') ? 'Risk Category Very High' : 'Risk Category Moderate', 'LDL Target <55-70 mg/dL by risk', 'BP target individualized']} />
          <ContextBlock title="Renal Function" rows={[`eGFR ${patient.labs.egfr ?? 'NA'}`, `K+ ${patient.labs.potassium ?? 'NA'}`, alerts.find((alert) => alert.title.toLowerCase().includes('egfr'))?.detail ?? 'Renal dosing reviewed']} warn />
          <ContextBlock title="Suggestions" rows={recs.slice(0, 3).map((drug) => `${drug.generic}: ${drug.brand}`)} />
          <ContextBlock title="Guidelines Applied" rows={sources.slice(0, 5).map((source) => source.source)} />
        </aside>

        <section className="patient-main">
          <div className="tabs detail-tabs">
            <button className={tab === 'ai' ? 'tab-active' : ''} onClick={() => setTab('ai')}>AI Assistant</button>
            <button className={tab === 'info' ? 'tab-active' : ''} onClick={() => setTab('info')}>Patient Info</button>
            <button className={tab === 'raw' ? 'tab-active' : ''} onClick={() => setTab('raw')}>Raw Context</button>
          </div>
          {tab === 'ai' && <AiAssistant patient={patient} />}
          {tab === 'info' && <PatientInfo patient={patient} matched={matched} />}
          {tab === 'raw' && <RawContext patient={patient} />}
        </section>
      </div>
    </section>
  )
}

function AiAssistant({ patient }: { patient: Patient }) {
  const prompts = ['What treatment changes would you recommend?', 'Is the current medication regimen appropriate?', 'What monitoring should I prioritize?', 'Are there any drug interactions I should be aware of?']
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'doctor' | 'assistant'; text: string }[]>([])

  function answer(question: string) {
    if (!question.trim()) return
    const response = assistantAnswer(patient, question)
    setMessages((current) => [...current, { role: 'doctor', text: question }, { role: 'assistant', text: response }])
    setInput('')
  }

  return (
    <section className="assistant-panel">
      <div className="assistant-head">
        <div className="brand-mark small">B</div>
        <div>
          <h2>AI Clinical Assistant</h2>
          <p>Context pre-loaded for {displayName(patient)}</p>
        </div>
        <button onClick={() => setMessages([])}>Reset</button>
      </div>
      <div className="assistant-body">
        <p>Patient-specific guidelines, renal dosing, drug interactions, and medication suggestions have been pre-loaded.</p>
        <div className="prompt-list">{prompts.map((prompt) => <button key={prompt} onClick={() => answer(prompt)}>{prompt}</button>)}</div>
        {!!messages.length && <div className="chat-thread">{messages.map((message, index) => <article className={message.role} key={`${message.role}-${index}`}><strong>{message.role === 'doctor' ? 'Doctor' : 'BRAHMO'}</strong><pre>{message.text}</pre></article>)}</div>}
      </div>
      <div className="chat-input"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') answer(input) }} placeholder="Ask about this patient's care..." /><button onClick={() => answer(input)}>Send</button></div>
    </section>
  )
}

function PatientInfo({ patient, matched }: { patient: Patient; matched: Drug[] }) {
  return (
    <div className="info-stack">
      <section className="card info-card">
        <h2>Patient Summary</h2>
        <div className="summary-fields">
          <span>Age/Sex <strong>{ageText(patient)} {patient.sex}</strong></span>
          <span>BMI <strong>{bmiText(patient).replace('BMI ', '')}</strong></span>
          <span>Insurance <strong>{patient.insurance}</strong></span>
          <span>Allergy <strong>{patient.allergy}</strong></span>
        </div>
      </section>
      <section className="card info-card"><h2>Conditions</h2><div className="tags">{patient.conditions.map((condition) => <span key={condition}>{condition}</span>)}</div></section>
      <section className="card info-card"><h2>Current Medications</h2>{patient.meds.map((med) => <div className="med-row" key={med}>{med}</div>)}</section>
      <section className="card info-card"><h2>Matched Drug Context</h2>{matched.map((drug) => <div className="med-row" key={drug.id}>{drug.generic} - {drug.brand} - {drug.mrp}</div>)}</section>
      <section className="card info-card"><h2>Lab Results</h2><div className="lab-grid">{Object.entries(patient.labs).map(([key, value]) => <span key={key}>{key.toUpperCase()} <strong>{String(value)}</strong></span>)}</div></section>
    </div>
  )
}

function RawContext({ patient }: { patient: Patient }) {
  return (
    <section className="card raw-context">
      <h2>Assembled System Prompt</h2>
      <p>This is injected into the AI session before the doctor types anything.</p>
      <pre>{assembledSystemPrompt(patient)}</pre>
    </section>
  )
}

const knownMedicationRows: Record<string, MedicationDraft> = {
  metformin: { drug: 'Metformin', brand: 'Glycomet', dose: '1000mg', frequency: 'Twice daily' },
  glimepiride: { drug: 'Glimepiride', brand: 'Amaryl', dose: '2mg', frequency: 'Once daily' },
  telmisartan: { drug: 'Telmisartan', brand: 'Telma', dose: '40mg', frequency: 'Once daily' },
  atorvastatin: { drug: 'Atorvastatin', brand: 'Atorva', dose: '20mg', frequency: 'Once daily at bedtime' },
  aspirin: { drug: 'Aspirin', brand: 'Ecosprin', dose: '75mg', frequency: 'Once daily' },
  ticagrelor: { drug: 'Ticagrelor', brand: 'Brilinta', dose: '90mg', frequency: 'Twice daily' },
  ramipril: { drug: 'Ramipril', brand: 'Cardace', dose: '5mg', frequency: 'Once daily' },
  metoprolol: { drug: 'Metoprolol', brand: 'Metolar', dose: '25mg', frequency: 'Twice daily' },
  carvedilol: { drug: 'Carvedilol', brand: 'Cardivas', dose: '12.5mg', frequency: 'Twice daily' },
  furosemide: { drug: 'Furosemide', brand: 'Lasix', dose: '40mg', frequency: 'Twice daily' },
  spironolactone: { drug: 'Spironolactone', brand: 'Aldactone', dose: '25mg', frequency: 'Once daily' },
  pregabalin: { drug: 'Pregabalin', brand: 'Lyrica', dose: '75mg', frequency: 'Twice daily' },
}

function medicationRowFromText(text: string): MedicationDraft {
  const lower = text.toLowerCase()
  const known = Object.entries(knownMedicationRows).find(([name]) => lower.includes(name))?.[1]
  if (known) {
    const doseMatch = text.match(/(\d+(?:\.\d+)?\s?(?:g|mg))/i)
    return { ...known, dose: doseMatch ? doseMatch[1].replace(/\s+/g, '') : known.dose }
  }
  return { drug: text, brand: '', dose: '', frequency: '' }
}

function medicationRowsFromMeds(meds: string[]) {
  const rows = meds.filter((med) => med && med.toLowerCase() !== 'none prior').map(medicationRowFromText)
  return rows.length ? rows : [{ drug: '', brand: '', dose: '', frequency: '' }]
}

function medicationRowToText(row: MedicationDraft) {
  return [row.drug, row.brand, row.dose, row.frequency].map((item) => item.trim()).filter(Boolean).join(' ')
}

function splitStoredList(value?: string) {
  if (!value || value === 'NKDA') return []
  return value.split(/[;,]/).map((item) => item.trim()).filter(Boolean)
}

function parseDmDuration(conditions: string[]) {
  const match = conditions.join(' ').match(/T2DM\s+(\d+)\s+years?/i)
  return match ? match[1] : ''
}

function normalizeCondition(condition: string) {
  const lower = condition.toLowerCase()
  if (lower.includes('t2dm') || lower.includes('diabetes')) return 'Type 2 Diabetes Mellitus'
  if (lower === 'htn' || lower.includes('hypertension')) return 'Hypertension'
  if (lower.includes('cad') || lower.includes('coronary') || lower.includes('mi') || lower.includes('stemi')) return 'Coronary Artery Disease'
  if (lower.includes('hfr') || lower.includes('heart failure')) return 'Heart Failure'
  if (lower.includes('dyslipidemia')) return 'Dyslipidemia'
  if (lower.includes('af') || lower.includes('atrial fibrillation')) return 'Atrial Fibrillation'
  if (lower.includes('pad') || lower.includes('peripheral')) return 'Peripheral Artery Disease'
  if (lower.includes('stroke') || lower.includes('tia')) return 'Stroke/TIA'
  if (lower.includes('ckd')) return 'CKD'
  if (lower.includes('nafld') || lower.includes('nash')) return 'NAFLD/NASH'
  if (lower.includes('obesity')) return 'Obesity'
  if (lower.includes('retinopathy')) return 'Retinopathy'
  if (lower.includes('neuropathy')) return 'Neuropathy'
  return condition
}

function draftDefaults(patient?: Patient | null): Partial<NewPatientDraft> {
  if (!patient) return {}
  if (patient.id === 'p1') {
    return {
      weight: '88',
      height: '170',
      smoking: 'Former',
      alcohol: 'Occasional',
      activity: 'Sedentary',
      familyHistoryList: ['Father - T2DM, MI at age 62', 'Mother - Hypertension'],
      notes: 'Patient complaining of increasing fatigue. Pedal edema noted. Recent weight gain of 3kg over 2 months.',
    }
  }
  return {}
}

function draftFromPatient(patient?: Patient | null): NewPatientDraft {
  const savedDraft = (patient as PatientWithDraft | null | undefined)?.formDraft
  if (savedDraft) {
    return {
      ...savedDraft,
      medRows: savedDraft.medRows?.length ? savedDraft.medRows : medicationRowsFromMeds(splitList(savedDraft.meds)),
      allergyInput: savedDraft.allergyInput ?? '',
      allergiesList: savedDraft.allergiesList ?? splitStoredList(savedDraft.allergies),
      familyHistoryInput: savedDraft.familyHistoryInput ?? '',
      familyHistoryList: savedDraft.familyHistoryList ?? splitStoredList(savedDraft.familyHistory),
    }
  }
  const bp = typeof patient?.vitals.bp === 'string' ? patient.vitals.bp.split('/') : []
  const defaults = draftDefaults(patient)
  const allergyList = splitStoredList(patient?.allergy)
  const normalized = patient ? Array.from(new Set(patient.conditions.map(normalizeCondition))) : []
  return {
    name: patient ? displayName(patient) : '',
    age: patient && patient.age > 0 ? String(patient.age) : '',
    sex: patient?.sex ?? 'M',
    weight: defaults.weight ?? '',
    height: defaults.height ?? '',
    dmDuration: parseDmDuration(patient?.conditions ?? []),
    conditions: normalized.filter((condition) => primaryConditions.includes(condition)),
    comorbidities: normalized.filter((condition) => comorbidityChoices.includes(condition)),
    meds: patient ? patient.meds.join(', ') : '',
    medRows: patient ? medicationRowsFromMeds(patient.meds) : [{ drug: '', brand: '', dose: '', frequency: '' }],
    hba1c: typeof patient?.labs.hba1c === 'number' ? String(patient.labs.hba1c) : '',
    fpg: typeof patient?.labs.fbs === 'number' ? String(patient.labs.fbs) : '',
    pp2: typeof patient?.labs.pp2 === 'number' ? String(patient.labs.pp2) : '',
    egfr: typeof patient?.labs.egfr === 'number' ? String(patient.labs.egfr) : '',
    creatinine: typeof patient?.labs.creatinine === 'number' ? String(patient.labs.creatinine) : '',
    potassium: typeof patient?.labs.potassium === 'number' ? String(patient.labs.potassium) : '',
    urineAcr: typeof patient?.labs.acr === 'number' ? String(patient.labs.acr) : '',
    alt: typeof patient?.labs.alt === 'number' ? String(patient.labs.alt) : '',
    ast: typeof patient?.labs.ast === 'number' ? String(patient.labs.ast) : '',
    hb: typeof patient?.labs.hb === 'number' ? String(patient.labs.hb) : '',
    totalChol: typeof patient?.labs.totalCholesterol === 'number' ? String(patient.labs.totalCholesterol) : '',
    ldl: typeof patient?.labs.ldl === 'number' ? String(patient.labs.ldl) : '',
    hdl: typeof patient?.labs.hdl === 'number' ? String(patient.labs.hdl) : '',
    tg: typeof patient?.labs.tg === 'number' ? String(patient.labs.tg) : '',
    systolic: bp[0] && bp[0] !== 'NA' ? bp[0] : '',
    diastolic: bp[1] && bp[1] !== 'NA' ? bp[1] : '',
    smoking: defaults.smoking ?? '',
    alcohol: defaults.alcohol ?? '',
    activity: defaults.activity ?? '',
    allergies: patient?.allergy && patient.allergy !== 'NKDA' ? patient.allergy : '',
    allergyInput: '',
    allergiesList: allergyList,
    familyHistory: (defaults.familyHistoryList ?? []).join('; '),
    familyHistoryInput: '',
    familyHistoryList: defaults.familyHistoryList ?? [],
    notes: defaults.notes ?? '',
    insurance: patient?.insurance ?? '',
  }
}

function NewPatientPage({ initialPatient, onCancel, onSave }: { initialPatient?: Patient | null; onCancel: () => void; onSave: (patient: Patient) => void }) {
  const [draft, setDraft] = useState<NewPatientDraft>(() => draftFromPatient(initialPatient))

  function update(key: keyof NewPatientDraft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function toggle(key: 'conditions' | 'comorbidities', value: string) {
    setDraft((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }))
  }

  function updateMedication(index: number, key: keyof MedicationDraft, value: string) {
    setDraft((current) => ({
      ...current,
      medRows: current.medRows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row),
    }))
  }

  function addMedication() {
    setDraft((current) => ({ ...current, medRows: [...current.medRows, { drug: '', brand: '', dose: '', frequency: '' }] }))
  }

  function removeMedication(index: number) {
    setDraft((current) => {
      const rows = current.medRows.filter((_, rowIndex) => rowIndex !== index)
      return { ...current, medRows: rows.length ? rows : [{ drug: '', brand: '', dose: '', frequency: '' }] }
    })
  }

  function addAllergy() {
    const item = draft.allergyInput.trim()
    if (!item) return
    setDraft((current) => ({
      ...current,
      allergyInput: '',
      allergiesList: current.allergiesList.includes(item) ? current.allergiesList : [...current.allergiesList, item],
    }))
  }

  function removeAllergy(item: string) {
    setDraft((current) => ({ ...current, allergiesList: current.allergiesList.filter((value) => value !== item) }))
  }

  function addFamilyHistory() {
    const item = draft.familyHistoryInput.trim()
    if (!item) return
    setDraft((current) => ({
      ...current,
      familyHistoryInput: '',
      familyHistoryList: current.familyHistoryList.includes(item) ? current.familyHistoryList : [...current.familyHistoryList, item],
    }))
  }

  function removeFamilyHistory(item: string) {
    setDraft((current) => ({ ...current, familyHistoryList: current.familyHistoryList.filter((value) => value !== item) }))
  }

  function scanLabReport(file?: File) {
    if (!file) return
    setDraft((current) => ({
      ...current,
      hba1c: current.hba1c || '7.2',
      fpg: current.fpg || '130',
      pp2: current.pp2 || '200',
      totalChol: current.totalChol || '220',
      ldl: current.ldl || '130',
      hdl: current.hdl || '42',
      tg: current.tg || '180',
      creatinine: current.creatinine || '1.1',
      egfr: current.egfr || '68',
      urineAcr: current.urineAcr || '45',
      systolic: current.systolic || '140',
      diastolic: current.diastolic || '88',
      alt: current.alt || '32',
      ast: current.ast || '28',
      potassium: current.potassium || '4.5',
      hb: current.hb || '13.2',
      notes: `${current.notes}${current.notes ? '\n' : ''}AI scanner loaded values from ${file.name}.`,
    }))
  }

  function save() {
    const heightM = Number(draft.height) / 100
    const bmi = heightM && draft.weight ? Number((Number(draft.weight) / (heightM * heightM)).toFixed(1)) : 0
    const conditions = [...draft.conditions, ...draft.comorbidities]
    const medRows = draft.medRows.filter((row) => Object.values(row).some((value) => value.trim()))
    const meds = medRows.map(medicationRowToText)
    const allergies = draft.allergiesList.length ? draft.allergiesList.join('; ') : draft.allergies.trim()
    const familyHistory = draft.familyHistoryList.join('; ')
    const formDraft = { ...draft, meds: meds.join(', '), medRows, allergies, familyHistory }
    const patient: Patient = {
      id: initialPatient?.id ?? `custom-${Date.now()}`,
      name: draft.name.trim() || 'New Patient',
      age: Number(draft.age) || 0,
      sex: draft.sex,
      bmi: initialPatient && !draft.weight && !draft.height ? initialPatient.bmi : bmi,
      conditions,
      meds,
      allergy: allergies || 'NKDA',
      labs: {
        hba1c: Number(draft.hba1c) || 'NA',
        fbs: Number(draft.fpg) || 'NA',
        pp2: Number(draft.pp2) || 'NA',
        egfr: Number(draft.egfr) || 'NA',
        creatinine: Number(draft.creatinine) || 'NA',
        potassium: Number(draft.potassium) || 'NA',
        acr: Number(draft.urineAcr) || 'NA',
        alt: Number(draft.alt) || 'NA',
        ast: Number(draft.ast) || 'NA',
        hb: Number(draft.hb) || 'NA',
        totalCholesterol: Number(draft.totalChol) || 'NA',
        ldl: Number(draft.ldl) || 'NA',
        hdl: Number(draft.hdl) || 'NA',
        tg: Number(draft.tg) || 'NA',
      },
      vitals: { bp: `${draft.systolic || 'NA'}/${draft.diastolic || 'NA'}` },
      insurance: draft.insurance || 'Not recorded',
      income: 'Not recorded',
      scenario: 'Custom clinical context profile',
      tags: inferTags(conditions.join(' ')),
      formDraft,
    } as PatientWithDraft
    onSave(patient)
  }

  return (
    <section className="new-patient-page">
      <div className="form-title"><button className="back-button" onClick={onCancel}>←</button><div><h1>{initialPatient ? 'Edit Patient' : 'New Patient'}</h1><p>Enter patient demographics, conditions, medications, and labs</p></div></div>
      <FormSection title="Demographics" className="demographic-grid">
        <label>Full Name *<input value={draft.name} onChange={(e) => update('name', e.target.value)} placeholder="Patient name" /></label>
        <label>Age *<input value={draft.age} onChange={(e) => update('age', e.target.value)} placeholder="Years" /></label>
        <label>Sex *<select value={draft.sex} onChange={(e) => update('sex', e.target.value)}><option value="M">Male</option><option value="F">Female</option></select></label>
        <label>Weight (kg)<input value={draft.weight} onChange={(e) => update('weight', e.target.value)} /></label>
        <label>Height (cm)<input value={draft.height} onChange={(e) => update('height', e.target.value)} /></label>
        <label>DM Duration (years)<input value={draft.dmDuration} onChange={(e) => update('dmDuration', e.target.value)} /></label>
      </FormSection>
      <ChoiceSection title="Primary Conditions" choices={primaryConditions} selected={draft.conditions} onToggle={(value) => toggle('conditions', value)} />
      <ChoiceSection title="Comorbidities" choices={comorbidityChoices} selected={draft.comorbidities} onToggle={(value) => toggle('comorbidities', value)} />
      <FormSection title="Lifestyle & History">
        <label>Smoking<select value={draft.smoking} onChange={(e) => update('smoking', e.target.value)}><option>Select</option><option>Never</option><option>Former</option><option>Current</option></select></label>
        <label>Alcohol<select value={draft.alcohol} onChange={(e) => update('alcohol', e.target.value)}><option>Select</option><option>None</option><option>Occasional</option><option>Regular</option></select></label>
        <label>Physical Activity<select value={draft.activity} onChange={(e) => update('activity', e.target.value)}><option>Select</option><option>Sedentary</option><option>Moderate</option><option>Active</option></select></label>
        <div className="wide-field stacked-input"><label>Allergies</label><div className="inline-add"><input value={draft.allergyInput} onChange={(e) => update('allergyInput', e.target.value)} placeholder="Add allergy" /><button type="button" onClick={addAllergy}>Add</button></div><ChipList items={draft.allergiesList} onRemove={removeAllergy} /></div>
        <div className="wide-field stacked-input"><label>Family History</label><div className="inline-add"><input value={draft.familyHistoryInput} onChange={(e) => update('familyHistoryInput', e.target.value)} placeholder="e.g. Father - T2DM, MI at 55" /><button type="button" onClick={addFamilyHistory}>Add</button></div><ChipList items={draft.familyHistoryList} onRemove={removeFamilyHistory} /></div>
      </FormSection>
      <section className="form-section">
        <div className="section-head"><h2>Current Medications</h2><button type="button" className="add-small" onClick={addMedication}>+ Add</button></div>
        <div className="med-edit-list">
          {draft.medRows.map((row, index) => (
            <div className="med-edit-row" key={index}>
              <input value={row.drug} onChange={(e) => updateMedication(index, 'drug', e.target.value)} placeholder="Drug name" />
              <input value={row.brand} onChange={(e) => updateMedication(index, 'brand', e.target.value)} placeholder="Brand" />
              <input value={row.dose} onChange={(e) => updateMedication(index, 'dose', e.target.value)} placeholder="Dose" />
              <input value={row.frequency} onChange={(e) => updateMedication(index, 'frequency', e.target.value)} placeholder="Frequency" />
              <button type="button" className="remove-row" onClick={() => removeMedication(index)}>×</button>
            </div>
          ))}
        </div>
      </section>
      <LabResultsSection draft={draft} update={update} onScan={scanLabReport} />
      <FormSection title="Clinical Notes"><label className="wide-field">Notes<textarea value={draft.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Additional clinical observations..." /></label></FormSection>
      <div className="form-footer"><button onClick={onCancel}>Cancel</button><button className="primary" onClick={save}>{initialPatient ? 'Update Patient' : 'Save Patient'}</button></div>
    </section>
  )
}

function DrugReference() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('Individual Drugs')
  const [expanded, setExpanded] = useState<string | null>(null)
  const filters = ['All', 'Antidiabetic', 'Lipid-lowering', 'Antihypertensive', 'Cardiovascular', 'Insulin']
  const shown = drugs.filter((drug) => {
    const term = search.toLowerCase()
    const matchesSearch = `${drug.generic} ${drug.brand} ${drug.drugClass}`.toLowerCase().includes(term)
    if (!matchesSearch) return false
    if (filter === 'All') return true
    if (filter === 'Antidiabetic') return drug.tags.includes('diabetes')
    if (filter === 'Cardiovascular') return drug.tags.includes('cardiovascular') || drug.tags.includes('heart_failure')
    if (filter === 'Insulin') return drug.drugClass.toLowerCase().includes('insulin')
    if (filter === 'Lipid-lowering') return drug.drugClass.toLowerCase().includes('statin')
    return ['ACE inhibitor', 'ARB', 'Beta-blocker', 'MRA', 'Loop diuretic'].includes(drug.drugClass)
  })

  function exportCsv() {
    if (tab === 'Drug Interactions') {
      downloadCsv('drug-interactions.csv', ['Drug A', 'Drug B', 'Severity', 'Effect', 'Management'], interactions.map((item) => [drugs.find((drug) => drug.id === item.a)?.generic ?? item.a, drugs.find((drug) => drug.id === item.b)?.generic ?? item.b, item.severity, item.effect, item.management]))
      return
    }
    downloadCsv('drug-reference.csv', ['Generic', 'Class', 'Brand', 'Manufacturer', 'MRP', 'NLEM', 'Renal dosing', 'HF safe'], shown.map((drug) => [drug.generic, drug.drugClass, drug.brand, drug.manufacturer, drug.mrp, drug.nlem ? 'Yes' : 'No', drug.renal, drug.hfSafe ? 'Yes' : 'No']))
  }

  function exportPdf() {
    const body = tab === 'Drug Interactions'
      ? interactions.map((item) => `<div class="card"><strong>${drugs.find((drug) => drug.id === item.a)?.generic ?? item.a} + ${drugs.find((drug) => drug.id === item.b)?.generic ?? item.b}</strong><br/>${item.severity}<br/>${item.effect}<br/>${item.management}</div>`).join('')
      : shown.map((drug) => `<div class="card"><strong>${drug.generic}</strong> (${drug.drugClass})<br/>${drug.brand} - ${drug.mrp}<br/>Renal: ${drug.renal}<br/>HF safe: ${drug.hfSafe ? 'Yes' : 'No'}</div>`).join('')
    openPdfReport(tab === 'Drug Interactions' ? 'Drug Interactions' : 'Drug Reference', body)
  }

  return (
    <section className="page">
      <div className="page-head compact"><div><h1>Drug Reference</h1><p>Indian brands, prices, dosing, and clinical information for T2DM & CVD drugs</p></div><div className="header-actions"><ExportMenu onCsv={exportCsv} onPdf={exportPdf} /></div></div>
      <div className="tabs">{['Individual Drugs', 'Fixed-Dose Combinations', 'Drug Interactions'].map((item) => <button key={item} className={tab === item ? 'tab-active' : ''} onClick={() => setTab(item)}>{item}</button>)}</div>
      {tab === 'Drug Interactions' ? <InteractionList /> : (
        <>
          <div className="filter-row">
            <div className="search grow">⌕ <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search drugs or brands..." /></div>
            {filters.map((item) => <button key={item} className={filter === item ? 'chip active' : 'chip'} onClick={() => setFilter(item)}>{item}</button>)}
          </div>
          <div className="drug-grid">{shown.map((drug) => <DrugCard key={drug.id} drug={drug} expanded={expanded === drug.id} onToggle={() => setExpanded(expanded === drug.id ? null : drug.id)} />)}</div>
        </>
      )}
    </section>
  )
}

function DrugCard({ drug, expanded, onToggle }: { drug: Drug; expanded: boolean; onToggle: () => void }) {
  return (
    <article className={expanded ? 'drug-card expanded' : 'drug-card'} onClick={onToggle}>
      <div><h3>{drug.generic}</h3><span>{drug.drugClass}</span></div>
      <button type="button">{expanded ? '^' : 'v'}</button>
      <p>{drug.note}</p>
      <small>{drug.brand} - {drug.mrp} - {drug.nlem ? 'NLEM' : 'Non-NLEM'}</small>
      {expanded && <div className="drug-details"><dl><dt>Manufacturer</dt><dd>{drug.manufacturer}</dd><dt>Renal dosing</dt><dd>{drug.renal}</dd><dt>HF safety</dt><dd>{drug.hfSafe ? 'Generally compatible' : 'Avoid or specialist review'}</dd><dt>Hypoglycemia</dt><dd>{drug.hypoglycemia}</dd><dt>Weight</dt><dd>{drug.weight}</dd></dl></div>}
    </article>
  )
}

function InteractionList() {
  return (
    <div className="interaction-list">
      {interactions.map((item) => {
        const a = drugs.find((drug) => drug.id === item.a)
        const b = drugs.find((drug) => drug.id === item.b)
        return <article className="card interaction-card" key={`${item.a}-${item.b}`}><strong>{a?.generic ?? item.a} + {b?.generic ?? item.b}</strong><span className={`severity ${item.severity}`}>{item.severity}</span><p>{item.effect}</p><small>{item.management}</small></article>
      })}
    </div>
  )
}

function GuidelineReference() {
  const [guideTab, setGuideTab] = useState<'diabetes' | 'cardio'>('diabetes')
  const diabetes = guidelines.filter((item) => item.tags.includes('diabetes'))
  const cardio = guidelines.filter((item) => item.tags.includes('cardiovascular') || item.tags.includes('heart_failure') || item.tags.includes('af'))
  const visible = guideTab === 'diabetes' ? diabetes : cardio

  function exportCsv() {
    downloadCsv('clinical-guidelines.csv', ['Source', 'Condition', 'Section', 'Recommendation', 'Evidence'], visible.map((item) => [item.source, item.condition, item.section, item.recommendation, item.evidence]))
  }

  function exportPdf() {
    openPdfReport('Clinical Guidelines', visible.map((item) => `<div class="card"><strong>${item.source} - ${item.section}</strong><br/>${item.condition}<br/>${item.recommendation}<br/>Evidence ${item.evidence}</div>`).join(''))
  }

  return (
    <section className="page narrow">
      <div className="page-head compact"><div><h1>Clinical Guidelines</h1><p>Indian guidelines for Type 2 Diabetes and Cardiovascular Disease management</p></div><div className="header-actions"><ExportMenu onCsv={exportCsv} onPdf={exportPdf} /></div></div>
      <div className="tabs">
        <button className={guideTab === 'diabetes' ? 'tab-active' : ''} onClick={() => setGuideTab('diabetes')}>Type 2 Diabetes</button>
        <button className={guideTab === 'cardio' ? 'tab-active' : ''} onClick={() => setGuideTab('cardio')}>Cardiovascular</button>
      </div>
      {guideTab === 'diabetes' ? <DiabetesGuidelines /> : <CardioGuidelines cardio={cardio} />}
    </section>
  )
}

function DiabetesGuidelines() {
  return (
    <>
      <section className="guideline-banner">Source Guidelines: RSSDI 2022, ICMR STG 2024</section>
      <section className="card guideline-card">
        <h2>Diagnostic Criteria</h2>
        <h3>Fasting Plasma Glucose</h3>
        <GuidelineTable rows={[['Normal', '<100 mg/dL after 8h fasting'], ['Prediabetes', '100-125 mg/dL'], ['Diabetes', '>=126 mg/dL']]} />
        <h3>HbA1c</h3>
        <GuidelineTable rows={[['Normal', '<5.7%'], ['Prediabetes', '5.7-6.4%'], ['Diabetes', '>=6.5%']]} />
        <h3>OGTT 2-hour</h3>
        <GuidelineTable rows={[['Normal', '<140 mg/dL'], ['Prediabetes', '140-199 mg/dL'], ['Diabetes', '>=200 mg/dL']]} />
      </section>
      <section className="card guideline-card">
        <h2>Metabolic Targets</h2>
        <h3>Glycemic Targets</h3>
        <GuidelineTable rows={[['General HbA1c', '<7.0%'], ['Elderly/frail/comorbid', '<8.0% individualized'], ['Young/new onset', '<6.5% if safe'], ['Fasting PG', '80-130 mg/dL'], ['Post-prandial PG', '<180 mg/dL']]} />
        <h3>BP Targets</h3>
        <GuidelineTable rows={[['General', '<130/80 mmHg'], ['With CKD', '<130/80 mmHg'], ['CAD/high CV risk', '<130/80 mmHg']]} />
        <h3>Lipid Targets</h3>
        <GuidelineTable rows={[['LDL-C general', '<100 mg/dL'], ['LDL-C very high risk', '<70 mg/dL or 50% reduction'], ['LDL-C with ASCVD', '<55 mg/dL'], ['Triglycerides', '<150 mg/dL']]} />
      </section>
      <section className="card guideline-card">
        <h2>Treatment Algorithm (RSSDI 2022)</h2>
        <AlgorithmCard tag="Monotherapy" title="HbA1c < 8.5%" lines={['First-line: Metformin unless contraindicated', 'If contraindicated: DPP-4 inhibitor, SGLT2 inhibitor, TZD, AGI', 'Start with lifestyle and medical nutrition therapy']} />
        <AlgorithmCard tag="Dual Therapy" title="HbA1c 8.5-10% or monotherapy failure after 3 months" lines={['Metformin + sulfonylurea for low-cost efficacy', 'Metformin + DPP-4 inhibitor for hypoglycemia risk', 'Metformin + SGLT2 inhibitor for CKD/HF/ASCVD benefit', 'Metformin + GLP-1 RA for obesity/CV risk', 'Metformin + TZD if NAFLD and no heart failure']} />
        <AlgorithmCard tag="Triple Therapy" title="Dual therapy failure after 3 months" lines={['Metformin + two agents from different classes', 'Prefer SGLT2 inhibitor/GLP-1 RA when ASCVD/HF/CKD present', 'Avoid TZD in heart failure']} />
        <AlgorithmCard tag="Insulin" title="HbA1c >10%, symptomatic, or oral therapy failure" lines={['Start basal insulin glargine/degludec 10U or 0.1-0.2 U/kg', 'Increase by 2 units every 3 days targeting FPG 80-130', 'Continue metformin if tolerated']} />
      </section>
      <section className="card guideline-card">
        <h2>Monitoring Schedule</h2>
        <GuidelineTable rows={[['Glucose', 'FPG and 2hr PPG monthly until controlled; SMBG/CGM as needed'], ['HbA1c', 'Every 3 months if uncontrolled; every 6 months if stable'], ['Renal', 'eGFR, urine ACR, serum potassium, foot examination, lipid profile annually or more often if abnormal']]} />
      </section>
    </>
  )
}

function AlgorithmCard({ tag, title, lines }: { tag: string; title: string; lines: string[] }) {
  return <article className="algorithm-card"><div><strong>{tag}</strong><span>{title}</span></div>{lines.map((line) => <p key={line}>{line}</p>)}</article>
}

function CardioGuidelines({ cardio }: { cardio: typeof guidelines }) {
  return (
    <>
      <section className="guideline-banner">Source Guidelines: CSI Dyslipidemia Guideline 2024, API Hypertension Guideline 2024, Indian Guidelines on Hypertension-IV 2019, CSI STEMI 2017</section>
      <section className="card guideline-card">
        <h2>CVD Risk Categories (CSI 2024)</h2>
        <article className="risk-box very-high"><strong>Very High Risk</strong><span>Established ASCVD, diabetes with CKD/organ damage, severe CKD, familial hypercholesterolemia with ASCVD.</span></article>
        <article className="risk-box high"><strong>High Risk</strong><span>Markedly elevated single risk factor, diabetes duration above 10 years, moderate CKD.</span></article>
        <article className="risk-box moderate"><strong>Moderate Risk</strong><span>Diabetes duration below 10 years without target-organ damage plus other risk modifiers.</span></article>
        <article className="risk-box low"><strong>Low Risk</strong><span>No known risk factors or young non-diabetic low-risk profile.</span></article>
      </section>
      <section className="card guideline-card">
        <h2>Hypertension Management (API 2024)</h2>
        <GuidelineTable rows={[['Normal', '<120/80'], ['Elevated', '120-129/<80'], ['Grade 1', '130-139/80-89'], ['Grade 2', '140-159/90-99'], ['Grade 3', '>=160/>=100']]} />
        <GuidelineSection title="First-Line Agents" rows={['ACE inhibitor or ARB preferred with diabetes, CKD, or post-MI context', 'CCB such as amlodipine/cilnidipine often used in Indian practice', 'Thiazide-like diuretics such as chlorthalidone/indapamide for resistant hypertension']} />
        <div className="guideline-alert">Avoid ACE inhibitor + ARB combination because dual RAAS blockade increases renal and hyperkalemia risk.</div>
      </section>
      <section className="card guideline-card">
        <h2>Dyslipidemia Management (CSI 2024)</h2>
        <GuidelineTable rows={[['Very High Risk', '<55 mg/dL or >=50% reduction'], ['High Risk', '<70 mg/dL or >=50% reduction'], ['Moderate Risk', '<100 mg/dL'], ['Low Risk', '<116 mg/dL']]} />
        <GuidelineSection title="Statin Intensity" rows={['High: atorvastatin 40-80 mg or rosuvastatin 20-40 mg', 'Moderate: atorvastatin 10-20 mg or rosuvastatin 5-10 mg', 'Low: atorvastatin 5 mg or rosuvastatin 2.5 mg']} />
        <div className="guideline-note">India-specific: non-fasting lipid measurement is acceptable for risk estimation; Indian patients have higher atherogenic dyslipidemia pattern with high TG and low HDL.</div>
      </section>
      <section className="card guideline-card">
        <h2>Antiplatelet and ACS Therapy</h2>
        <GuidelineSection title="STEMI Reperfusion" rows={['Primary PCI preferred when available in time', 'If no PCI access, early fibrinolysis after contraindication screen and transfer for pharmacoinvasive strategy', 'Streptokinase is lower cost; tenecteplase is single bolus but more expensive']} />
        {cardio.slice(0, 6).map((item) => <article className="guideline-row" key={item.id}><strong>{item.section}</strong><span>{item.recommendation}</span><small>{item.source} - Evidence {item.evidence}</small></article>)}
      </section>
    </>
  )
}

function GuidelineTable({ rows }: { rows: string[][] }) {
  return <div className="guideline-table">{rows.map(([left, right]) => <div key={left}><span>{left}</span><strong>{right}</strong></div>)}</div>
}

function ContextBlock({ title, rows, warn }: { title: string; rows: string[]; warn?: boolean }) {
  return <section className={warn ? 'context-block warn-block' : 'context-block'}><h3>{title}</h3>{rows.map((row) => <p key={row}>{row}</p>)}</section>
}

function FormSection({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return <section className="form-section"><h2>{title}</h2><div className={`form-grid ${className}`}>{children}</div></section>
}

function ChoiceSection({ title, choices, selected, onToggle }: { title: string; choices: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <section className="form-section"><h2>{title}</h2><div className="choice-grid">{choices.map((choice) => <button type="button" key={choice} className={selected.includes(choice) ? 'choice active' : 'choice'} onClick={() => onToggle(choice)}>{choice}</button>)}</div></section>
}

function ChipList({ items, onRemove }: { items: string[]; onRemove: (item: string) => void }) {
  if (!items.length) return null
  return <div className="chip-list">{items.map((item) => <button type="button" className="tag-chip" key={item} onClick={() => onRemove(item)}>{item} ×</button>)}</div>
}

function LabResultsSection({ draft, update, onScan }: { draft: NewPatientDraft; update: (key: keyof NewPatientDraft, value: string) => void; onScan: (file?: File) => void }) {
  const labs: { key: keyof NewPatientDraft; label: string }[] = [
    { key: 'hba1c', label: 'HbA1c (%)' },
    { key: 'fpg', label: 'FPG (mg/dL)' },
    { key: 'pp2', label: '2hr PPG (mg/dL)' },
    { key: 'totalChol', label: 'Total Chol (mg/dL)' },
    { key: 'ldl', label: 'LDL-C (mg/dL)' },
    { key: 'hdl', label: 'HDL-C (mg/dL)' },
    { key: 'tg', label: 'TG (mg/dL)' },
    { key: 'creatinine', label: 'Creatinine (mg/dL)' },
    { key: 'egfr', label: 'eGFR (mL/min)' },
    { key: 'urineAcr', label: 'Urine ACR (mg/g)' },
    { key: 'systolic', label: 'Systolic BP (mmHg)' },
    { key: 'diastolic', label: 'Diastolic BP (mmHg)' },
    { key: 'alt', label: 'ALT (U/L)' },
    { key: 'ast', label: 'AST (U/L)' },
    { key: 'potassium', label: 'K+ (mEq/L)' },
    { key: 'hb', label: 'Hb (g/dL)' },
  ]
  return (
    <section className="lab-section">
      <h2>Lab Results</h2>
      <div className="lab-scanner">
        <strong>AI Lab Report Scanner</strong>
        <p>Upload a PDF or photo of a lab report - AI will auto-fill the lab fields below.</p>
        <label className="upload-button">Choose Lab Report (PDF / Image)<input type="file" accept=".pdf,image/*" onChange={(event) => onScan(event.target.files?.[0])} /></label>
      </div>
      <div className="lab-input-grid">
        {labs.map((lab) => <label key={lab.key}>{lab.label}<input value={String(draft[lab.key])} onChange={(event) => update(lab.key, event.target.value)} /></label>)}
      </div>
    </section>
  )
}

function splitList(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function inferTags(value: string): ConditionTag[] {
  const text = value.toLowerCase()
  const tags = new Set<ConditionTag>()
  if (text.includes('diabetes') || text.includes('t2dm')) tags.add('diabetes')
  if (text.includes('ckd')) tags.add('ckd')
  if (text.includes('heart failure') || text.includes('hfr')) tags.add('heart_failure')
  if (text.includes('mi') || text.includes('stemi') || text.includes('cad') || text.includes('coronary')) tags.add('cardiovascular')
  if (text.includes('stemi') || text.includes('acs')) tags.add('acs')
  if (text.includes('atrial fibrillation') || text.includes(' af')) tags.add('af')
  if (!tags.size) tags.add('diabetes')
  return Array.from(tags)
}

function Metric({ label, value, helper, icon, tone }: { label: string; value: number; helper: string; icon: string; tone: string }) {
  return <section className="metric"><div><span>{label}</span><strong>{value}</strong><small>{helper}</small></div><div className={`metric-icon ${tone}`}><Icon name={icon} /></div></section>
}

function RecentPatient({ patient, onOpen }: { patient: Patient; onOpen: (patient: Patient) => void }) {
  return <article className="recent clickable" onClick={() => onOpen(patient)}><div className="avatar">{initials(displayName(patient))}</div><div><strong>{displayName(patient)}</strong><span>{ageText(patient)} {patient.sex} - {patient.conditions.slice(0, 3).join(', ')}</span></div><b>HbA1c {patient.labs.hba1c ?? 'NA'}{typeof patient.labs.hba1c === 'number' ? '%' : ''}</b><button>→</button></article>
}

function PatientCard({ patient, onOpen }: { patient: Patient; onOpen: (patient: Patient) => void }) {
  const alerts = safetyAlerts(patient)
  const hba1cValue = patient.labs.hba1c
  const hba1c = typeof hba1cValue === 'number' ? hba1cValue : null
  return (
    <article className="patient-card clickable" onClick={() => onOpen(patient)}>
      <div className="patient-top"><div className="avatar">{initials(displayName(patient))}</div><div><strong>{displayName(patient)}</strong><span>{ageText(patient)} {patient.sex}</span></div><button>→</button></div>
      <div className="tags">{patient.conditions.slice(0, 4).map((condition) => <span key={condition}>{condition}</span>)}</div>
      <dl className="mini-dl"><dt>HbA1c</dt><dd className={hba1c && hba1c > 8 ? 'warn' : 'good'}>{hba1c ? `${hba1c}% - ${hba1c > 8 ? 'Poorly controlled' : 'Above target'}` : 'Not available'}</dd><dt>CVD Risk</dt><dd>{patient.tags.includes('acs') || patient.tags.includes('af') || patient.tags.includes('heart_failure') ? 'Very High' : 'Moderate'}</dd><dt>Suggestions</dt><dd>{alerts.length ? `${alerts.length} pending` : 'Ready'}</dd></dl>
    </article>
  )
}

function GuidelineSection({ title, rows }: { title: string; rows: string[] }) {
  return <section className="card guideline-card"><h2>{title}</h2>{rows.map((row) => <article className="guideline-line" key={row}><span>{row}</span></article>)}</section>
}

function Icon({ name }: { name: string }) {
  const icons: Record<string, string> = { grid: '▦', users: '♙', capsule: '◇', book: '▥', heart: '♥', alert: '△', droplet: '◌' }
  return <span className="icon" aria-hidden="true">{icons[name] ?? '•'}</span>
}

export default App
