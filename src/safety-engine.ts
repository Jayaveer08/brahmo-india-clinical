import { contacts, drugs, guidelines, interactions, type Drug, type Guideline, type Patient } from './clinical-data'

export type Alert = {
  severity: 'critical' | 'high' | 'moderate' | 'info'
  title: string
  detail: string
}

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '')

export function matchDrug(text: string): Drug | undefined {
  const key = normalize(text)
  return drugs.find((drug) => {
    const candidates = [drug.id, drug.generic, drug.brand, ...drug.generic.split('+')]
    return candidates.some((candidate) => key.includes(normalize(candidate)))
  })
}

export function patientDrugs(patient: Patient): Drug[] {
  const found = patient.meds.map(matchDrug).filter(Boolean) as Drug[]
  return Array.from(new Map(found.map((drug) => [drug.id, drug])).values())
}

export function ckdStage(egfr?: number | string) {
  if (typeof egfr !== 'number') return 'unknown'
  if (egfr >= 90) return 'G1'
  if (egfr >= 60) return 'G2'
  if (egfr >= 45) return 'G3a'
  if (egfr >= 30) return 'G3b'
  if (egfr >= 15) return 'G4'
  return 'G5'
}

export function cha2ds2Vasc(patient: Patient) {
  let score = 0
  const conditions = patient.conditions.join(' ').toLowerCase()
  if (conditions.includes('heart failure') || conditions.includes('hfr')) score += 1
  if (conditions.includes('htn')) score += 1
  if (patient.age >= 75) score += 2
  else if (patient.age >= 65) score += 1
  if (conditions.includes('diabetes') || conditions.includes('t2dm')) score += 1
  if (conditions.includes('mi') || conditions.includes('des') || conditions.includes('vascular')) score += 1
  if (patient.sex === 'F') score += 1
  return score
}

export function activeGuidelines(patient: Patient): Guideline[] {
  return guidelines.filter((guideline) => guideline.tags.some((tag) => patient.tags.includes(tag)))
}

export function safetyAlerts(patient: Patient): Alert[] {
  const alerts: Alert[] = []
  const meds = patientDrugs(patient)
  const egfr = patient.labs.egfr
  const potassium = patient.labs.potassium
  const hasHF = patient.tags.includes('heart_failure')
  const hasCKD = typeof egfr === 'number' && egfr < 60

  if (typeof egfr === 'number') {
    alerts.push({ severity: egfr < 45 ? 'high' : 'info', title: `eGFR ${egfr} -> CKD ${ckdStage(egfr)}`, detail: egfr < 45 ? 'Renal dosing context must be injected before therapy advice.' : 'Renal function allows usual dosing for most options.' })
  }

  if (patient.allergy.toLowerCase().includes('penicillin') && patient.allergy.toLowerCase().includes('anaphylaxis')) {
    alerts.push({ severity: 'critical', title: 'Penicillin anaphylaxis hard block', detail: 'If antibiotics are needed during admission, avoid penicillins and clearly label the allergy.' })
  }

  meds.forEach((drug) => {
    if (hasCKD && drug.id === 'glimepiride') {
      alerts.push({ severity: 'critical', title: 'Stop glimepiride in CKD risk context', detail: 'Sulfonylurea hypoglycemia risk rises with CKD; patient-specific plan should avoid glimepiride.' })
    }
    if (hasHF && ['pioglitazone', 'saxagliptin', 'glimepiride'].includes(drug.id)) {
      alerts.push({ severity: 'critical', title: `${drug.generic} is unsafe in this HF phenotype`, detail: drug.id === 'pioglitazone' ? 'Fluid retention can worsen HFrEF.' : drug.id === 'saxagliptin' ? 'Avoid where HF risk exists.' : 'Hypoglycemia and weight gain are poor fits in HFrEF.' })
    }
    if (hasCKD && drug.id === 'metformin' && typeof egfr === 'number' && egfr < 45) {
      alerts.push({ severity: 'high', title: 'Metformin renal review', detail: 'At eGFR below 45, reassess dose and sick-day rules; avoid initiation below 30.' })
    }
  })

  if (typeof potassium === 'number' && potassium >= 5 && meds.some((d) => d.id === 'spironolactone') && meds.some((d) => d.id === 'ramipril')) {
    alerts.push({ severity: 'critical', title: `K+ ${potassium}: ramipril + spironolactone hyperkalemia`, detail: 'Hold/down-titrate potassium-raising HF therapy pending repeat K, ECG context, and renal review.' })
  }

  for (let i = 0; i < meds.length; i += 1) {
    for (let j = i + 1; j < meds.length; j += 1) {
      const hit = interactions.find((item) => (item.a === meds[i].id && item.b === meds[j].id) || (item.a === meds[j].id && item.b === meds[i].id))
      if (hit) {
        alerts.push({ severity: hit.severity === 'hard-block' ? 'critical' : hit.severity === 'high' ? 'high' : hit.severity === 'moderate' ? 'moderate' : 'info', title: `${meds[i].generic} + ${meds[j].generic}`, detail: `${hit.effect} ${hit.management}` })
      }
    }
  }

  if (patient.tags.includes('af')) {
    const score = cha2ds2Vasc(patient)
    alerts.push({ severity: score >= 2 ? 'high' : 'moderate', title: `CHA2DS2-VASc = ${score}`, detail: score >= 2 ? 'Anticoagulation is indicated unless bleeding risk or valvular AF changes strategy.' : 'Discuss anticoagulation by sex-specific threshold and bleeding risk.' })
    if (meds.some((d) => d.id === 'aspirin') && meds.some((d) => d.id === 'ticagrelor')) {
      alerts.push({ severity: 'critical', title: 'Triple therapy dilemma', detail: 'Adding DOAC to aspirin + ticagrelor is high bleeding risk; CSI/IHRS context should prefer shortest triple therapy and early de-escalation.' })
    }
  }

  if (patient.tags.includes('acs')) {
    alerts.push({ severity: 'critical', title: 'Code STEMI pathway', detail: 'Cath lab available: activate Dr. Venkat ext 4455 and CCU 3322 for primary PCI. If no PCI, compare streptokinase vs tenecteplase cost/access.' })
  }

  return alerts
}

export function recommendedDrugs(patient: Patient): Drug[] {
  if (patient.id === 'p4') return byIds(['aspirin', 'ticagrelor', 'heparin', 'atorvastatin', 'streptokinase', 'tenecteplase'])
  if (patient.id === 'p5') return byIds(['rivaroxaban', 'apixaban', 'warfarin', 'clopidogrel', 'aspirin', 'ticagrelor'])
  if (patient.id === 'p6') return byIds(['empagliflozin', 'dapagliflozin', 'metformin', 'ramipril', 'carvedilol', 'spironolactone'])
  if (patient.id === 'p2') return byIds(['insulin-glargine', 'regular-insulin', 'teneligliptin', 'empagliflozin', 'metformin', 'glimepiride'])
  if (patient.id === 'p3') return byIds(['metformin', 'teneligliptin', 'pioglitazone', 'empagliflozin', 'regular-insulin'])
  return byIds(['teneligliptin', 'empagliflozin', 'dapagliflozin', 'vildagliptin-metformin', 'voglibose', 'glimepiride'])
}

function byIds(ids: string[]) {
  return ids.map((id) => drugs.find((drug) => drug.id === id)).filter(Boolean) as Drug[]
}

export function composeGenericResponse(patient: Patient) {
  const isAcs = patient.tags.includes('acs')
  const isAf = patient.tags.includes('af')
  if (isAcs) return 'Generic AI: Treat as STEMI. Give aspirin, P2Y12 inhibitor, anticoagulation, statin, and arrange urgent reperfusion per standard international ACS guidance. Consider thrombolysis if PCI is unavailable. Monitor vitals and allergies.'
  if (isAf) return 'Generic AI: New atrial fibrillation after PCI may require anticoagulation plus antiplatelet therapy. Balance stroke and bleeding risk using standard risk scores and consider a DOAC.'
  if (patient.tags.includes('heart_failure')) return 'Generic AI: In diabetes with heart failure, consider SGLT2 inhibitor and optimize heart failure therapy. Monitor kidney function and potassium.'
  return 'Generic AI: Intensify diabetes therapy after metformin with SGLT2 inhibitor, GLP-1 receptor agonist, DPP-4 inhibitor, sulfonylurea, or insulin depending on glycemic control and comorbidities.'
}

export function composeOptionCResponse(patient: Patient) {
  const alerts = safetyAlerts(patient)
  const recs = recommendedDrugs(patient)
  const sources = activeGuidelines(patient).slice(0, 6)
  const sourceNames = Array.from(new Set(sources.map((g) => g.source))).join(', ')

  if (patient.id === 'p4') {
    return [
      'Option C India context: anterior STEMI with BP 95/62 and cath lab available. Use CSI STEMI pathway, not ACC/AHA language.',
      'MINUTE 0: call Code STEMI, Dr. Venkat ext 4455, CCU 3322, IV access, defib pads, avoid nitrates because BP is low, document penicillin anaphylaxis as a hard block.',
      'MINUTE 5: aspirin loading + ticagrelor/prasugrel/clopidogrel per PCI plan, UFH/enoxaparin protocol, high-intensity atorvastatin. Brilinta 90 costs around INR 1,930/month; clopidogrel is far cheaper.',
      'MINUTE 10: primary PCI is preferred. If no cath lab: streptokinase around INR 5,500 vs tenecteplase around INR 29,500; choose with bleeding screen, timing, and affordability.',
      `Injected sources: ${sourceNames}. Top alert: ${alerts[0]?.title}.`,
    ].join('\n\n')
  }

  if (patient.id === 'p5') {
    return [
      `Option C computes CHA2DS2-VASc = ${cha2ds2Vasc(patient)} for AF after MI/DES, so anticoagulation is needed unless bleeding risk dominates.`,
      'Current aspirin + ticagrelor plus a DOAC would create triple therapy. CSI/IHRS context: keep triple therapy shortest possible, then OAC + single antiplatelet, often clopidogrel rather than ticagrelor when bleeding risk matters.',
      'Indian choices: rivaroxaban Xarelto 20 around INR 3,075/month, apixaban Eliquis 5 around INR 7,380/month, or warfarin Warf around INR 24/month with INR monitoring. CGHS coverage may change the practical choice.',
      `Injected sources: ${sourceNames}. Safety focus: ${alerts.map((a) => a.title).slice(0, 2).join('; ')}.`,
    ].join('\n\n')
  }

  if (patient.id === 'p6') {
    return [
      'Option C merges RSSDI diabetes + CSI heart failure context. The key move is not just lowering HbA1c; it is avoiding HF harm while adding cardiorenal benefit.',
      'Must catch: pioglitazone is contraindicated in HFrEF; glimepiride is a poor fit because CKD/HF raises severe hypoglycemia consequences; K+ 5.1 with ramipril + spironolactone is a hyperkalemia alert.',
      'Preferred diabetes add-on: empagliflozin or dapagliflozin because SGLT2 inhibitors help both T2DM and HFrEF/CKD. Monitor volume status with furosemide and BP 110/68.',
      `Indian options shown: ${recs.map((d) => `${d.brand} (${d.mrp})`).join(', ')}.`,
      `Contacts: ${contacts.cardiology[2]}, ${contacts.endocrinology[0]}.`,
    ].join('\n\n')
  }

  if (patient.id === 'p2') {
    return [
      'Option C: eGFR 32 means CKD G3b. Stop glimepiride due to hypoglycemia risk; review metformin dose/sick-day plan because eGFR is below 45.',
      'Transition plan: basal insulin such as Basalog 100 IU (about INR 510/cartridge) or human insulin if cost pressure is dominant. Teneligliptin is a low-hypoglycemia Indian DPP-4 option if oral bridge is needed.',
      `Referrals: ${contacts.endocrinology[0]}, ${contacts.endocrinology[2]}, ${contacts.endocrinology[3]}.`,
      `Injected sources: ${sourceNames}.`,
    ].join('\n\n')
  }

  if (patient.id === 'p3') {
    return [
      'Option C: uninsured daily-wage patient, so NLEM/low-cost therapy matters as much as efficacy. Metformin remains the base at around INR 70/month.',
      'Affordable add-ons: teneligliptin around INR 310/month, pioglitazone around INR 195/month and can help NAFLD, but avoid if HF develops. Empagliflozin has weight/cardiorenal appeal but at around INR 1,635/month may be unaffordable.',
      'Diet context: refer South Indian meal planning around rice/idli/dosa portions, protein, and oil reduction; do not give a US carbohydrate template.',
      `Injected sources: ${sourceNames}.`,
    ].join('\n\n')
  }

  return [
    'Option C: RSSDI-based intensification after metformin with India-specific brands, cost, and safety constraints.',
    'Sulfonamide rash makes sulfonylurea discussion cautious; with BMI 31, prefer weight-neutral/loss options if budget allows. Teneligliptin is affordable and weight neutral; SGLT2 inhibitors give weight/cardiorenal advantages at higher cost.',
    `Within INR 5K/month cap: ${recs.slice(0, 4).map((d) => `${d.brand} ${d.mrp}`).join(', ')}.`,
    `Dietitian referral: ${contacts.endocrinology[1]} for carb-heavy South Indian diet. Injected sources: ${sourceNames}.`,
  ].join('\n\n')
}
