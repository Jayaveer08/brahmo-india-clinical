export type ConditionTag =
  | 'diabetes'
  | 'cardiovascular'
  | 'heart_failure'
  | 'ckd'
  | 'acs'
  | 'af'
  | 'rhd'

export type Drug = {
  id: string
  generic: string
  drugClass: string
  brand: string
  manufacturer: string
  mrp: string
  monthlyCost: number
  nlem: boolean
  renal: string
  hfSafe: boolean
  weight: 'gain' | 'neutral' | 'loss'
  hypoglycemia: 'low' | 'moderate' | 'high'
  tags: ConditionTag[]
  note: string
}

export type Guideline = {
  id: string
  source: 'RSSDI 2022' | 'CSI STEMI 2017' | 'CSI/IHRS' | 'MoHFW STG' | 'NLEM 2022'
  condition: string
  section: string
  recommendation: string
  evidence: string
  tags: ConditionTag[]
}

export type Interaction = {
  a: string
  b: string
  severity: 'hard-block' | 'high' | 'moderate' | 'monitor'
  mechanism: string
  effect: string
  management: string
}

export type Patient = {
  id: string
  name: string
  age: number
  sex: 'M' | 'F'
  bmi: number
  conditions: string[]
  meds: string[]
  allergy: string
  labs: Record<string, number | string>
  vitals: Record<string, number | string>
  insurance: string
  income: string
  scenario: string
  tags: ConditionTag[]
}

export const drugs: Drug[] = [
  { id: 'metformin', generic: 'Metformin', drugClass: 'Biguanide', brand: 'Glycomet 500 SR', manufacturer: 'USV', mrp: 'INR 45/strip of 20', monthlyCost: 70, nlem: true, renal: 'Review below eGFR 45; avoid/initiate with caution below 30.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['diabetes'], note: 'First-line, low cost.' },
  { id: 'glimepiride', generic: 'Glimepiride', drugClass: 'Sulfonylurea', brand: 'Amaryl 2 mg', manufacturer: 'Sanofi', mrp: 'INR 155/strip of 15', monthlyCost: 310, nlem: true, renal: 'Avoid or use very low dose in CKD; higher hypoglycemia risk.', hfSafe: false, weight: 'gain', hypoglycemia: 'high', tags: ['diabetes', 'ckd'], note: 'Cheap but risky in CKD/elderly/HF.' },
  { id: 'gliclazide', generic: 'Gliclazide', drugClass: 'Sulfonylurea', brand: 'Diamicron MR 60', manufacturer: 'Servier', mrp: 'INR 190/strip of 15', monthlyCost: 380, nlem: true, renal: 'Preferred sulfonylurea in mild-moderate CKD if SU unavoidable.', hfSafe: false, weight: 'gain', hypoglycemia: 'moderate', tags: ['diabetes'], note: 'Lower hypoglycemia than glimepiride.' },
  { id: 'teneligliptin', generic: 'Teneligliptin', drugClass: 'DPP-4 inhibitor', brand: 'Tenglyn 20', manufacturer: 'Zydus', mrp: 'INR 103/strip of 10', monthlyCost: 310, nlem: false, renal: 'No dose adjustment commonly used across renal stages.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['diabetes', 'ckd'], note: 'Important India-specific low-cost DPP-4 option.' },
  { id: 'sitagliptin', generic: 'Sitagliptin', drugClass: 'DPP-4 inhibitor', brand: 'Januvia 100', manufacturer: 'MSD', mrp: 'INR 493/strip of 7', monthlyCost: 2110, nlem: false, renal: 'Reduce dose by eGFR band.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['diabetes'], note: 'Costlier DPP-4 inhibitor.' },
  { id: 'saxagliptin', generic: 'Saxagliptin', drugClass: 'DPP-4 inhibitor', brand: 'Onglyza 5', manufacturer: 'AstraZeneca', mrp: 'INR 430/strip of 14', monthlyCost: 920, nlem: false, renal: 'Dose reduce in renal impairment.', hfSafe: false, weight: 'neutral', hypoglycemia: 'low', tags: ['diabetes', 'heart_failure'], note: 'Avoid in HF risk where alternatives exist.' },
  { id: 'empagliflozin', generic: 'Empagliflozin', drugClass: 'SGLT2 inhibitor', brand: 'Jardiance 10', manufacturer: 'Boehringer Ingelheim', mrp: 'INR 545/strip of 10', monthlyCost: 1635, nlem: false, renal: 'Glycemic efficacy falls with low eGFR; cardiorenal benefit persists by indication.', hfSafe: true, weight: 'loss', hypoglycemia: 'low', tags: ['diabetes', 'heart_failure', 'ckd'], note: 'Dual T2DM/HF/CKD benefit.' },
  { id: 'dapagliflozin', generic: 'Dapagliflozin', drugClass: 'SGLT2 inhibitor', brand: 'Forxiga 10', manufacturer: 'AstraZeneca', mrp: 'INR 590/strip of 14', monthlyCost: 1265, nlem: false, renal: 'Use by eGFR and indication; monitor volume status.', hfSafe: true, weight: 'loss', hypoglycemia: 'low', tags: ['diabetes', 'heart_failure', 'ckd'], note: 'HF benefit with or without diabetes.' },
  { id: 'pioglitazone', generic: 'Pioglitazone', drugClass: 'TZD', brand: 'Pioz 15', manufacturer: 'USV', mrp: 'INR 65/strip of 10', monthlyCost: 195, nlem: false, renal: 'No renal dose change; avoid fluid overload.', hfSafe: false, weight: 'gain', hypoglycemia: 'low', tags: ['diabetes', 'heart_failure'], note: 'Cheap and useful in NAFLD, contraindicated in symptomatic HF.' },
  { id: 'liraglutide', generic: 'Liraglutide', drugClass: 'GLP-1 RA', brand: 'Victoza', manufacturer: 'Novo Nordisk', mrp: 'INR 4,300/pen', monthlyCost: 8600, nlem: false, renal: 'Use caution in advanced CKD/GI intolerance.', hfSafe: true, weight: 'loss', hypoglycemia: 'low', tags: ['diabetes'], note: 'Weight loss; expensive.' },
  { id: 'insulin-glargine', generic: 'Insulin glargine', drugClass: 'Basal insulin', brand: 'Basalog 100 IU', manufacturer: 'Biocon', mrp: 'INR 510/cartridge', monthlyCost: 900, nlem: true, renal: 'Insulin needs may fall in CKD; titrate carefully.', hfSafe: true, weight: 'gain', hypoglycemia: 'high', tags: ['diabetes', 'ckd'], note: 'Practical insulin transition option.' },
  { id: 'regular-insulin', generic: 'Regular insulin', drugClass: 'Human insulin', brand: 'Human Actrapid', manufacturer: 'Novo Nordisk', mrp: 'INR 165/vial', monthlyCost: 500, nlem: true, renal: 'Dose conservatively in CKD.', hfSafe: true, weight: 'gain', hypoglycemia: 'high', tags: ['diabetes'], note: 'NLEM and low cost.' },
  { id: 'vildagliptin-metformin', generic: 'Vildagliptin + Metformin', drugClass: 'FDC DPP-4 + biguanide', brand: 'Galvus Met 50/500', manufacturer: 'Novartis', mrp: 'INR 335/strip of 15', monthlyCost: 1340, nlem: false, renal: 'Metformin component limits use in CKD.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['diabetes'], note: 'Common Indian FDC.' },
  { id: 'voglibose', generic: 'Voglibose', drugClass: 'Alpha-glucosidase inhibitor', brand: 'Volibo 0.3', manufacturer: 'Sun Pharma', mrp: 'INR 130/strip of 10', monthlyCost: 780, nlem: false, renal: 'Avoid severe renal impairment.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['diabetes'], note: 'Targets post-prandial spikes in high-carb diets.' },
  { id: 'rosuvastatin', generic: 'Rosuvastatin', drugClass: 'Statin', brand: 'Rosuvas 20', manufacturer: 'Sun Pharma', mrp: 'INR 285/strip of 15', monthlyCost: 570, nlem: false, renal: 'Dose caution in severe CKD.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['cardiovascular'], note: 'High-intensity statin option.' },
  { id: 'atorvastatin', generic: 'Atorvastatin', drugClass: 'Statin', brand: 'Atorva 40', manufacturer: 'Zydus', mrp: 'INR 210/strip of 15', monthlyCost: 420, nlem: true, renal: 'No major renal dose change.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['cardiovascular', 'acs'], note: 'NLEM high-intensity statin in ACS.' },
  { id: 'aspirin', generic: 'Aspirin', drugClass: 'Antiplatelet', brand: 'Ecosprin 75', manufacturer: 'USV', mrp: 'INR 6/strip of 14', monthlyCost: 13, nlem: true, renal: 'Bleeding/renal caution in CKD.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['cardiovascular', 'acs'], note: 'Core ACS antiplatelet.' },
  { id: 'clopidogrel', generic: 'Clopidogrel', drugClass: 'P2Y12 inhibitor', brand: 'Clopilet 75', manufacturer: 'Sun Pharma', mrp: 'INR 99/strip of 15', monthlyCost: 198, nlem: true, renal: 'No renal dose change; bleeding caution.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['cardiovascular', 'acs'], note: 'Affordable P2Y12 option.' },
  { id: 'ticagrelor', generic: 'Ticagrelor', drugClass: 'P2Y12 inhibitor', brand: 'Brilinta 90', manufacturer: 'AstraZeneca', mrp: 'INR 450/strip of 14', monthlyCost: 1930, nlem: false, renal: 'No renal dose change; bleeding/dyspnea caution.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['cardiovascular', 'acs'], note: 'Potent ACS option; higher cost.' },
  { id: 'prasugrel', generic: 'Prasugrel', drugClass: 'P2Y12 inhibitor', brand: 'Prasita 10', manufacturer: 'Torrent', mrp: 'INR 245/strip of 10', monthlyCost: 735, nlem: false, renal: 'Avoid prior stroke/TIA; bleeding caution.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['cardiovascular', 'acs'], note: 'PCI antiplatelet option.' },
  { id: 'heparin', generic: 'Unfractionated heparin', drugClass: 'Anticoagulant', brand: 'Beparine 5000 IU', manufacturer: 'Biological E', mrp: 'INR 170/vial', monthlyCost: 170, nlem: true, renal: 'Often preferred when renal function unstable; monitor aPTT.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['cardiovascular', 'acs'], note: 'Cath lab/ACS anticoagulation.' },
  { id: 'enoxaparin', generic: 'Enoxaparin', drugClass: 'LMWH', brand: 'Clexane 60', manufacturer: 'Sanofi', mrp: 'INR 625/pfs', monthlyCost: 625, nlem: true, renal: 'Dose reduce below eGFR 30.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['cardiovascular', 'acs'], note: 'ACS anticoagulant.' },
  { id: 'streptokinase', generic: 'Streptokinase', drugClass: 'Fibrinolytic', brand: 'STPase 1.5 MU', manufacturer: 'Cadila', mrp: 'INR 5,500/vial', monthlyCost: 5500, nlem: true, renal: 'No renal dose change; bleeding contraindications apply.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['cardiovascular', 'acs'], note: 'Lower-cost fibrinolytic for non-PCI settings.' },
  { id: 'tenecteplase', generic: 'Tenecteplase', drugClass: 'Fibrinolytic', brand: 'Metalyse 40 mg', manufacturer: 'Boehringer Ingelheim', mrp: 'INR 29,500/vial', monthlyCost: 29500, nlem: false, renal: 'No renal dose change; bleeding contraindications apply.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['cardiovascular', 'acs'], note: 'Single-bolus but much higher cost.' },
  { id: 'ramipril', generic: 'Ramipril', drugClass: 'ACE inhibitor', brand: 'Cardace 5', manufacturer: 'Sanofi', mrp: 'INR 120/strip of 15', monthlyCost: 240, nlem: true, renal: 'Monitor creatinine and potassium.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['cardiovascular', 'heart_failure', 'ckd'], note: 'Post-MI/HF/CKD benefit.' },
  { id: 'telmisartan', generic: 'Telmisartan', drugClass: 'ARB', brand: 'Telma 40', manufacturer: 'Glenmark', mrp: 'INR 115/strip of 15', monthlyCost: 230, nlem: true, renal: 'Monitor creatinine and potassium.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['cardiovascular', 'ckd'], note: 'BP and albuminuria option.' },
  { id: 'metoprolol', generic: 'Metoprolol', drugClass: 'Beta-blocker', brand: 'Metolar XR 25', manufacturer: 'Cipla', mrp: 'INR 85/strip of 15', monthlyCost: 170, nlem: true, renal: 'No major renal adjustment.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['cardiovascular', 'acs', 'heart_failure'], note: 'Can mask hypoglycemia symptoms.' },
  { id: 'carvedilol', generic: 'Carvedilol', drugClass: 'Beta-blocker', brand: 'Cardivas 12.5', manufacturer: 'Sun Pharma', mrp: 'INR 125/strip of 10', monthlyCost: 750, nlem: true, renal: 'No major renal adjustment; monitor BP.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['cardiovascular', 'heart_failure'], note: 'Evidence-based HF beta-blocker.' },
  { id: 'spironolactone', generic: 'Spironolactone', drugClass: 'MRA', brand: 'Aldactone 25', manufacturer: 'RPG', mrp: 'INR 35/strip of 15', monthlyCost: 70, nlem: true, renal: 'Avoid or hold when K high or eGFR low; monitor potassium.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['cardiovascular', 'heart_failure'], note: 'HF benefit but hyperkalemia risk.' },
  { id: 'furosemide', generic: 'Furosemide', drugClass: 'Loop diuretic', brand: 'Lasix 40', manufacturer: 'Sanofi', mrp: 'INR 12/strip of 15', monthlyCost: 48, nlem: true, renal: 'Higher doses may be needed in CKD; monitor electrolytes.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['cardiovascular', 'heart_failure'], note: 'Congestion relief.' },
  { id: 'rivaroxaban', generic: 'Rivaroxaban', drugClass: 'DOAC', brand: 'Xarelto 20', manufacturer: 'Bayer', mrp: 'INR 1,435/strip of 14', monthlyCost: 3075, nlem: false, renal: 'Dose by CrCl/eGFR; avoid severe renal impairment.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['cardiovascular', 'af'], note: 'AF anticoagulation; watch antiplatelet bleeding.' },
  { id: 'apixaban', generic: 'Apixaban', drugClass: 'DOAC', brand: 'Eliquis 5', manufacturer: 'Pfizer', mrp: 'INR 1,230/strip of 10', monthlyCost: 7380, nlem: false, renal: 'Dose reduce by age/weight/creatinine criteria.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['cardiovascular', 'af'], note: 'Lower GI bleed tendency; high cost.' },
  { id: 'warfarin', generic: 'Warfarin', drugClass: 'VKA', brand: 'Warf 5', manufacturer: 'Cipla', mrp: 'INR 24/strip of 30', monthlyCost: 24, nlem: true, renal: 'Usable in CKD; INR monitoring required.', hfSafe: true, weight: 'neutral', hypoglycemia: 'low', tags: ['cardiovascular', 'af', 'rhd'], note: 'Preferred for mechanical valves/mitral stenosis AF.' },
]

export const guidelines: Guideline[] = [
  { id: 'rssdi-1', source: 'RSSDI 2022', condition: 'T2DM', section: 'First line', recommendation: 'Lifestyle therapy plus metformin is the usual first-line pharmacologic strategy unless contraindicated.', evidence: 'A', tags: ['diabetes'] },
  { id: 'rssdi-2', source: 'RSSDI 2022', condition: 'T2DM', section: 'Therapy choice', recommendation: 'After metformin, choose add-on therapy by ASCVD/HF/CKD status, weight, hypoglycemia risk, cost, and access.', evidence: 'A', tags: ['diabetes'] },
  { id: 'rssdi-3', source: 'RSSDI 2022', condition: 'T2DM with CKD', section: 'Renal safety', recommendation: 'Use renal function to adjust therapy; sulfonylureas carry higher hypoglycemia risk in CKD.', evidence: 'B', tags: ['diabetes', 'ckd'] },
  { id: 'rssdi-4', source: 'RSSDI 2022', condition: 'T2DM', section: 'SGLT2', recommendation: 'SGLT2 inhibitors are preferred when cardiorenal benefit is needed, including heart failure or CKD phenotypes.', evidence: 'A', tags: ['diabetes', 'heart_failure', 'ckd'] },
  { id: 'rssdi-5', source: 'RSSDI 2022', condition: 'T2DM', section: 'DPP-4', recommendation: 'DPP-4 inhibitors have low hypoglycemia risk and are weight neutral; India has multiple low-cost options including teneligliptin.', evidence: 'B', tags: ['diabetes'] },
  { id: 'rssdi-6', source: 'RSSDI 2022', condition: 'T2DM', section: 'Insulin', recommendation: 'Initiate basal insulin when HbA1c remains high despite oral agents or when oral therapy is unsafe.', evidence: 'A', tags: ['diabetes'] },
  { id: 'rssdi-7', source: 'RSSDI 2022', condition: 'T2DM', section: 'Diet', recommendation: 'Medical nutrition therapy should adapt to local cereal-heavy meals, portion size, and referral to a diabetes dietitian.', evidence: 'B', tags: ['diabetes'] },
  { id: 'rssdi-8', source: 'RSSDI 2022', condition: 'T2DM', section: 'Targets', recommendation: 'Individualize HbA1c targets by age, comorbidity, hypoglycemia risk, and life expectancy.', evidence: 'A', tags: ['diabetes'] },
  { id: 'csi-1', source: 'CSI STEMI 2017', condition: 'STEMI', section: 'Reperfusion', recommendation: 'Primary PCI is preferred when it can be performed in time by an available cath lab team.', evidence: 'A', tags: ['cardiovascular', 'acs'] },
  { id: 'csi-2', source: 'CSI STEMI 2017', condition: 'STEMI', section: 'Non-PCI setting', recommendation: 'If timely PCI is unavailable, give fibrinolysis early after contraindication screen, followed by transfer for pharmacoinvasive care.', evidence: 'A', tags: ['cardiovascular', 'acs'] },
  { id: 'csi-3', source: 'CSI STEMI 2017', condition: 'STEMI', section: 'Antiplatelet', recommendation: 'Give aspirin plus a P2Y12 inhibitor with anticoagulation unless contraindicated.', evidence: 'A', tags: ['cardiovascular', 'acs'] },
  { id: 'csi-4', source: 'CSI STEMI 2017', condition: 'STEMI', section: 'Systems', recommendation: 'Door-to-balloon and door-to-needle workflows should be protocolized with early activation of cath lab/CCU.', evidence: 'B', tags: ['cardiovascular', 'acs'] },
  { id: 'csi-5', source: 'CSI STEMI 2017', condition: 'STEMI', section: 'Shock risk', recommendation: 'Hypotension in STEMI requires urgent reperfusion, careful nitrates avoidance, and hemodynamic monitoring.', evidence: 'B', tags: ['cardiovascular', 'acs'] },
  { id: 'csi-6', source: 'CSI/IHRS', condition: 'AF after PCI', section: 'Triple therapy', recommendation: 'Triple therapy increases bleeding; keep duration as short as possible, then continue OAC plus single antiplatelet based on ischemic and bleeding risk.', evidence: 'B', tags: ['cardiovascular', 'af'] },
  { id: 'csi-7', source: 'CSI/IHRS', condition: 'AF', section: 'Stroke risk', recommendation: 'Use CHA2DS2-VASc to decide anticoagulation for non-valvular AF; consider VKA for rheumatic mitral stenosis/mechanical valves.', evidence: 'A', tags: ['cardiovascular', 'af', 'rhd'] },
  { id: 'csi-8', source: 'CSI/IHRS', condition: 'HF', section: 'Foundational therapy', recommendation: 'HFrEF therapy includes RAAS blockade, evidence beta-blocker, MRA when potassium permits, and SGLT2 inhibitor.', evidence: 'A', tags: ['cardiovascular', 'heart_failure'] },
  { id: 'overlap-1', source: 'RSSDI 2022', condition: 'T2DM + HF', section: 'Avoid harm', recommendation: 'Avoid pioglitazone in symptomatic HF because of fluid retention and worsening HF risk.', evidence: 'A', tags: ['diabetes', 'heart_failure'] },
  { id: 'overlap-2', source: 'CSI/IHRS', condition: 'HF + CKD', section: 'Hyperkalemia', recommendation: 'ACE inhibitor plus MRA needs potassium surveillance; hold or down-titrate when potassium is elevated.', evidence: 'A', tags: ['heart_failure', 'ckd'] },
  { id: 'overlap-3', source: 'RSSDI 2022', condition: 'T2DM + HF', section: 'Preferred glucose drug', recommendation: 'Prefer an SGLT2 inhibitor when diabetes coexists with heart failure or CKD unless contraindicated.', evidence: 'A', tags: ['diabetes', 'heart_failure', 'ckd'] },
]

export const interactions: Interaction[] = [
  { a: 'glimepiride', b: 'metoprolol', severity: 'high', mechanism: 'Beta-blocker masks adrenergic warning signs of hypoglycemia.', effect: 'Delayed recognition of severe hypoglycemia.', management: 'Prefer non-SU agent or intensify glucose monitoring.' },
  { a: 'glimepiride', b: 'carvedilol', severity: 'high', mechanism: 'Beta-blocker plus sulfonylurea.', effect: 'Hypoglycemia symptoms masked in HF patient.', management: 'Stop glimepiride in HF/CKD overlap; use SGLT2 or insulin plan.' },
  { a: 'spironolactone', b: 'ramipril', severity: 'high', mechanism: 'Dual RAAS/potassium retention.', effect: 'Hyperkalemia, especially CKD.', management: 'Check K and renal function; hold MRA/ACEi when K is high.' },
  { a: 'spironolactone', b: 'telmisartan', severity: 'high', mechanism: 'ARB plus MRA potassium retention.', effect: 'Hyperkalemia.', management: 'Avoid or monitor closely.' },
  { a: 'aspirin', b: 'rivaroxaban', severity: 'high', mechanism: 'Antiplatelet plus anticoagulant.', effect: 'Major bleeding risk.', management: 'Use shortest triple therapy duration; add PPI and reassess aspirin.' },
  { a: 'ticagrelor', b: 'rivaroxaban', severity: 'high', mechanism: 'Potent P2Y12 plus DOAC.', effect: 'High bleeding risk.', management: 'Prefer OAC plus clopidogrel after early period when appropriate.' },
  { a: 'aspirin', b: 'apixaban', severity: 'high', mechanism: 'Antiplatelet plus anticoagulant.', effect: 'Major bleeding risk.', management: 'Use only if clear ischemic indication.' },
  { a: 'ticagrelor', b: 'apixaban', severity: 'high', mechanism: 'Potent P2Y12 plus DOAC.', effect: 'High bleeding risk.', management: 'De-escalate to clopidogrel when clinically appropriate.' },
  { a: 'metformin', b: 'furosemide', severity: 'moderate', mechanism: 'Volume depletion/AKI risk can raise metformin exposure.', effect: 'Lactic acidosis risk if AKI develops.', management: 'Sick-day rule and renal monitoring.' },
  { a: 'empagliflozin', b: 'furosemide', severity: 'moderate', mechanism: 'Additive natriuresis/diuresis.', effect: 'Volume depletion or hypotension.', management: 'Assess congestion/BP and consider diuretic adjustment.' },
  { a: 'dapagliflozin', b: 'furosemide', severity: 'moderate', mechanism: 'Additive diuretic effect.', effect: 'Volume depletion.', management: 'Monitor BP, weight, creatinine.' },
  { a: 'warfarin', b: 'aspirin', severity: 'high', mechanism: 'VKA plus antiplatelet.', effect: 'Bleeding.', management: 'Use only with strong indication and INR plan.' },
  { a: 'warfarin', b: 'clopidogrel', severity: 'high', mechanism: 'VKA plus P2Y12.', effect: 'Bleeding.', management: 'Shortest duration and gastroprotection.' },
  { a: 'atorvastatin', b: 'ticagrelor', severity: 'monitor', mechanism: 'CYP3A/P-gp interaction potential.', effect: 'Statin adverse effects possible.', management: 'Monitor myalgia/LFT; keep dose appropriate.' },
  { a: 'metformin', b: 'ramipril', severity: 'monitor', mechanism: 'RAAS changes renal hemodynamics.', effect: 'Metformin accumulation if AKI occurs.', management: 'Monitor creatinine after ACEi changes.' },
  { a: 'pioglitazone', b: 'furosemide', severity: 'high', mechanism: 'TZD fluid retention counteracts diuresis.', effect: 'Worsening edema/HF.', management: 'Avoid pioglitazone in HFrEF.' },
  { a: 'saxagliptin', b: 'furosemide', severity: 'moderate', mechanism: 'HF hospitalization signal plus existing HF therapy.', effect: 'Potential HF worsening.', management: 'Prefer teneligliptin/sitagliptin or SGLT2 inhibitor.' },
  { a: 'enoxaparin', b: 'aspirin', severity: 'moderate', mechanism: 'Anticoagulant plus antiplatelet.', effect: 'Bleeding.', management: 'Use ACS protocol dosing; monitor bleeding.' },
  { a: 'heparin', b: 'aspirin', severity: 'moderate', mechanism: 'Anticoagulant plus antiplatelet.', effect: 'Bleeding.', management: 'Use protocol and monitor.' },
  { a: 'streptokinase', b: 'heparin', severity: 'moderate', mechanism: 'Fibrinolytic plus anticoagulant.', effect: 'Bleeding.', management: 'Follow fibrinolysis protocol.' },
  { a: 'tenecteplase', b: 'heparin', severity: 'moderate', mechanism: 'Fibrinolytic plus anticoagulant.', effect: 'Bleeding.', management: 'Follow fibrinolysis protocol.' },
]

export const patients: Patient[] = [
  { id: 'p1', name: 'Failing Metformin', age: 48, sex: 'M', bmi: 31.1, conditions: ['T2DM 3 years', 'HTN'], meds: ['Metformin 1 g BD', 'Telmisartan 40 mg OD'], allergy: 'Sulfonamide rash', labs: { hba1c: 8.4, fbs: 168, creatinine: 0.9, egfr: 92, ldl: 142, tg: 280 }, vitals: { bp: '134/86', hr: 78 }, insurance: 'Star Health Gold, generic covered, branded pre-auth, INR 5K/month cap', income: 'Middle-class salaried', scenario: 'Which second-line drug?', tags: ['diabetes'] },
  { id: 'p2', name: 'Complex with CKD', age: 62, sex: 'F', bmi: 27.2, conditions: ['T2DM 12 years', 'CKD 3b', 'HTN', 'retinopathy', 'neuropathy'], meds: ['Metformin 500 mg BD', 'Glimepiride 2 mg OD', 'Atorvastatin 20 mg HS', 'Telmisartan 80 mg OD', 'Aspirin 75 mg OD', 'Pregabalin 75 mg BD'], allergy: 'NKDA', labs: { hba1c: 9.2, creatinine: 1.8, egfr: 32, potassium: 4.9, acr: 380 }, vitals: { bp: 'not provided' }, insurance: 'New India Assurance, INR 3L cap mostly exhausted', income: 'Cost-sensitive', scenario: 'Insulin transition with CKD', tags: ['diabetes', 'ckd'] },
  { id: 'p3', name: 'Auto-Driver', age: 34, sex: 'M', bmi: 35.3, conditions: ['New T2DM', 'obesity', 'NAFLD'], meds: ['Metformin 500 mg BD'], allergy: 'NKDA', labs: { hba1c: 8.8, fbs: 186, alt: 68, creatinine: 0.8, egfr: 108, tg: 320, hdl: 32 }, vitals: { bp: 'not provided' }, insurance: 'None', income: 'Auto-rickshaw driver, INR 800-1000/day', scenario: 'Affordable second-line choice', tags: ['diabetes'] },
  { id: 'p4', name: 'Acute STEMI', age: 52, sex: 'M', bmi: 26.8, conditions: ['Anterior STEMI', 'smoker', 'family history premature MI'], meds: ['None prior'], allergy: 'Penicillin anaphylaxis in 2020', labs: { troponin: 12.4, creatinine: 1.0, egfr: 84, potassium: 4.2, glucose: 142 }, vitals: { hr: 108, bp: '95/62', spo2: '93%', rr: 24 }, insurance: 'ESI covers emergency', income: 'Not stated', scenario: 'Acute STEMI immediate management', tags: ['cardiovascular', 'acs'] },
  { id: 'p5', name: 'Post-MI + New AF', age: 66, sex: 'M', bmi: 28.4, conditions: ['Anterior MI 3 months ago', 'DES to LAD', 'T2DM', 'HTN', 'new AF'], meds: ['Aspirin 75 mg', 'Ticagrelor 90 mg BD', 'Atorvastatin 80 mg', 'Ramipril 5 mg', 'Metoprolol 25 mg BD', 'Metformin 1 g BD'], allergy: 'NKDA', labs: { hba1c: 7.4, creatinine: 1.1, egfr: 68, potassium: 4.4 }, vitals: { hr: '88 irregularly irregular', bp: '128/78' }, insurance: 'CGHS covers most drugs', income: 'Insured', scenario: 'Triple therapy dilemma', tags: ['cardiovascular', 'af', 'diabetes'] },
  { id: 'p6', name: 'Diabetes + Heart Failure', age: 58, sex: 'F', bmi: 30.2, conditions: ['T2DM 8 years', 'HFrEF EF 30%', 'HTN', 'CKD 3a'], meds: ['Metformin 500 mg BD', 'Glimepiride 1 mg OD', 'Ramipril 10 mg OD', 'Carvedilol 12.5 mg BD', 'Furosemide 40 mg BD', 'Spironolactone 25 mg OD', 'Atorvastatin 40 mg HS'], allergy: 'NKDA', labs: { hba1c: 8.6, creatinine: 1.4, egfr: 48, potassium: 5.1, bnp: 850, sodium: 134 }, vitals: { hr: 72, bp: '110/68', spo2: '94%' }, insurance: 'Star Health INR 5K/month cap', income: 'Insured cap', scenario: 'Drugs that help vs harm', tags: ['diabetes', 'heart_failure', 'ckd', 'cardiovascular'] },
]

export const contacts = {
  endocrinology: ['Sister Lakshmi diabetes educator ext 3345', 'Ms. Priya Raman dietitian ext 3350', 'Dr. Iyer ophthalmology ext 4410', 'Dr. Ramachandran nephrology ext 4420'],
  cardiology: ['Dr. Venkat interventional cardiology ext 4455', 'CCU nurse station ext 3322', 'Dr. Anand electrophysiology ext 4460', 'Dr. Meena heart failure clinic ext 4465'],
  emergency: ['Code STEMI: call 4455 and alert CCU 3322', 'Blood bank: O-negative available, 2 units standby'],
}

export const sourceLinks = [
  'RSSDI clinical practice recommendations for management of type 2 diabetes mellitus 2022',
  'CSI position statement on management of ST elevation myocardial infarction in India',
  'Indian Heart Rhythm Society / CSI AF and post-PCI antithrombotic guidance',
  'National List of Essential Medicines India 2022',
  'Tata 1mg, PharmEasy, Netmeds price lookups verified May 2026',
]
