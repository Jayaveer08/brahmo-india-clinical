insert into drugs (id, generic_name, generic_name_normalized, drug_class, drug_subclass, indian_brand_name, manufacturer, mrp_price, monthly_cost_inr, nlem_status, renal_dosing, hf_safe, weight_effect, hypoglycemia_risk, condition_tags, source_note) values
('metformin','Metformin','metformin','Biguanide',null,'Glycomet 500 SR','USV','INR 45/strip of 20',70,true,'{"rule":"review below eGFR 45; avoid/initiate with caution below 30"}',true,'neutral','low','["diabetes"]','1mg/PharmEasy price lookup; NLEM 2022'),
('glimepiride','Glimepiride','glimepiride','Sulfonylurea',null,'Amaryl 2 mg','Sanofi','INR 155/strip of 15',310,true,'{"rule":"avoid or use low dose in CKD; high hypoglycemia risk"}',false,'gain','high','["diabetes","ckd"]','1mg price lookup; NLEM 2022'),
('teneligliptin','Teneligliptin','teneligliptin','DPP-4 inhibitor',null,'Tenglyn 20','Zydus','INR 103/strip of 10',310,false,'{"rule":"commonly used without renal dose adjustment"}',true,'neutral','low','["diabetes","ckd"]','1mg price lookup'),
('empagliflozin','Empagliflozin','empagliflozin','SGLT2 inhibitor',null,'Jardiance 10','Boehringer Ingelheim','INR 545/strip of 10',1635,false,'{"rule":"use by eGFR and cardiorenal indication"}',true,'loss','low','["diabetes","heart_failure","ckd"]','1mg price lookup'),
('dapagliflozin','Dapagliflozin','dapagliflozin','SGLT2 inhibitor',null,'Forxiga 10','AstraZeneca','INR 590/strip of 14',1265,false,'{"rule":"monitor volume status and renal function"}',true,'loss','low','["diabetes","heart_failure","ckd"]','1mg price lookup'),
('pioglitazone','Pioglitazone','pioglitazone','TZD',null,'Pioz 15','USV','INR 65/strip of 10',195,false,'{"rule":"no renal dose change; avoid fluid overload"}',false,'gain','low','["diabetes","heart_failure"]','1mg price lookup'),
('insulin-glargine','Insulin glargine','insulinglargine','Basal insulin',null,'Basalog 100 IU','Biocon','INR 510/cartridge',900,true,'{"rule":"insulin needs may fall in CKD; titrate carefully"}',true,'gain','high','["diabetes","ckd"]','1mg price lookup; NLEM insulin class'),
('regular-insulin','Regular insulin','regularinsulin','Human insulin',null,'Human Actrapid','Novo Nordisk','INR 165/vial',500,true,'{"rule":"dose conservatively in CKD"}',true,'gain','high','["diabetes"]','1mg price lookup; NLEM 2022'),
('aspirin','Aspirin','aspirin','Antiplatelet',null,'Ecosprin 75','USV','INR 6/strip of 14',13,true,'{"rule":"bleeding and renal caution in CKD"}',true,'neutral','low','["cardiovascular","acs"]','1mg price lookup; NLEM 2022'),
('clopidogrel','Clopidogrel','clopidogrel','P2Y12 inhibitor',null,'Clopilet 75','Sun Pharma','INR 99/strip of 15',198,true,'{"rule":"no renal dose change; bleeding caution"}',true,'neutral','low','["cardiovascular","acs"]','1mg price lookup; NLEM 2022'),
('ticagrelor','Ticagrelor','ticagrelor','P2Y12 inhibitor',null,'Brilinta 90','AstraZeneca','INR 450/strip of 14',1930,false,'{"rule":"no renal dose change; bleeding/dyspnea caution"}',true,'neutral','low','["cardiovascular","acs"]','1mg price lookup'),
('atorvastatin','Atorvastatin','atorvastatin','Statin',null,'Atorva 40','Zydus','INR 210/strip of 15',420,true,'{"rule":"no major renal dose change"}',true,'neutral','low','["cardiovascular","acs"]','1mg price lookup; NLEM 2022'),
('heparin','Unfractionated heparin','unfractionatedheparin','Anticoagulant',null,'Beparine 5000 IU','Biological E','INR 170/vial',170,true,'{"rule":"monitor aPTT; useful if renal function unstable"}',true,'neutral','low','["cardiovascular","acs"]','1mg price lookup; NLEM 2022'),
('streptokinase','Streptokinase','streptokinase','Fibrinolytic',null,'STPase 1.5 MU','Cadila','INR 5,500/vial',5500,true,'{"rule":"screen fibrinolysis contraindications"}',true,'neutral','low','["cardiovascular","acs"]','Indian pharmacy price lookup; NLEM 2022'),
('tenecteplase','Tenecteplase','tenecteplase','Fibrinolytic',null,'Metalyse 40 mg','Boehringer Ingelheim','INR 29,500/vial',29500,false,'{"rule":"screen fibrinolysis contraindications"}',true,'neutral','low','["cardiovascular","acs"]','Indian pharmacy price lookup'),
('ramipril','Ramipril','ramipril','ACE inhibitor',null,'Cardace 5','Sanofi','INR 120/strip of 15',240,true,'{"rule":"monitor creatinine and potassium"}',true,'neutral','low','["cardiovascular","heart_failure","ckd"]','1mg price lookup; NLEM 2022'),
('metoprolol','Metoprolol','metoprolol','Beta-blocker',null,'Metolar XR 25','Cipla','INR 85/strip of 15',170,true,'{"rule":"no major renal dose adjustment"}',true,'neutral','low','["cardiovascular","acs","heart_failure"]','1mg price lookup; NLEM 2022'),
('carvedilol','Carvedilol','carvedilol','Beta-blocker',null,'Cardivas 12.5','Sun Pharma','INR 125/strip of 10',750,true,'{"rule":"monitor BP"}',true,'neutral','low','["cardiovascular","heart_failure"]','1mg price lookup; NLEM 2022'),
('spironolactone','Spironolactone','spironolactone','MRA',null,'Aldactone 25','RPG','INR 35/strip of 15',70,true,'{"rule":"avoid or hold with high K or low eGFR"}',true,'neutral','low','["cardiovascular","heart_failure"]','1mg price lookup; NLEM 2022'),
('furosemide','Furosemide','furosemide','Loop diuretic',null,'Lasix 40','Sanofi','INR 12/strip of 15',48,true,'{"rule":"monitor electrolytes and renal function"}',true,'neutral','low','["cardiovascular","heart_failure"]','1mg price lookup; NLEM 2022'),
('rivaroxaban','Rivaroxaban','rivaroxaban','DOAC',null,'Xarelto 20','Bayer','INR 1,435/strip of 14',3075,false,'{"rule":"dose by renal function"}',true,'neutral','low','["cardiovascular","af"]','1mg price lookup'),
('apixaban','Apixaban','apixaban','DOAC',null,'Eliquis 5','Pfizer','INR 1,230/strip of 10',7380,false,'{"rule":"dose by age weight creatinine criteria"}',true,'neutral','low','["cardiovascular","af"]','1mg price lookup'),
('warfarin','Warfarin','warfarin','VKA',null,'Warf 5','Cipla','INR 24/strip of 30',24,true,'{"rule":"INR monitoring; usable in CKD"}',true,'neutral','low','["cardiovascular","af","rhd"]','1mg price lookup; NLEM 2022')
on conflict (id) do nothing;

insert into indian_guidelines (id, source_id, condition, section, recommendation, evidence_level, condition_tags, source_url) values
('rssdi-1','RSSDI 2022','T2DM','First line','Lifestyle therapy plus metformin is usual first-line pharmacologic strategy unless contraindicated.','A','["diabetes"]','https://rssdi.in/newwebsite/'),
('rssdi-2','RSSDI 2022','T2DM','Therapy choice','After metformin, choose add-on therapy by ASCVD/HF/CKD status, weight, hypoglycemia risk, cost, and access.','A','["diabetes"]','https://www.ijddc.com/'),
('rssdi-3','RSSDI 2022','T2DM with CKD','Renal safety','Use renal function to adjust therapy; sulfonylureas carry higher hypoglycemia risk in CKD.','B','["diabetes","ckd"]','https://www.ijddc.com/'),
('rssdi-4','RSSDI 2022','T2DM','SGLT2','SGLT2 inhibitors are preferred when cardiorenal benefit is needed, including heart failure or CKD phenotypes.','A','["diabetes","heart_failure","ckd"]','https://www.ijddc.com/'),
('rssdi-5','RSSDI 2022','T2DM','Diet','Medical nutrition therapy should adapt to local cereal-heavy meals and portion size.','B','["diabetes"]','https://www.ijddc.com/'),
('csi-1','CSI STEMI 2017','STEMI','Reperfusion','Primary PCI is preferred when it can be performed in time by an available cath lab team.','A','["cardiovascular","acs"]','https://csi.org.in/'),
('csi-2','CSI STEMI 2017','STEMI','Non-PCI setting','If timely PCI is unavailable, give fibrinolysis early after contraindication screen, followed by transfer for pharmacoinvasive care.','A','["cardiovascular","acs"]','https://csi.org.in/'),
('csi-3','CSI STEMI 2017','STEMI','Antiplatelet','Give aspirin plus a P2Y12 inhibitor with anticoagulation unless contraindicated.','A','["cardiovascular","acs"]','https://csi.org.in/'),
('csi-4','CSI/IHRS','AF after PCI','Triple therapy','Triple therapy increases bleeding; keep duration as short as possible, then continue OAC plus single antiplatelet by risk.','B','["cardiovascular","af"]','https://ihrs.in/'),
('csi-5','CSI/IHRS','HF','Foundational therapy','HFrEF therapy includes RAAS blockade, evidence beta-blocker, MRA when potassium permits, and SGLT2 inhibitor.','A','["cardiovascular","heart_failure"]','https://csi.org.in/'),
('overlap-1','RSSDI 2022','T2DM + HF','Avoid harm','Avoid pioglitazone in symptomatic HF because of fluid retention and worsening HF risk.','A','["diabetes","heart_failure"]','https://www.ijddc.com/'),
('overlap-2','CSI/IHRS','HF + CKD','Hyperkalemia','ACE inhibitor plus MRA needs potassium surveillance; hold or down-titrate when potassium is elevated.','A','["heart_failure","ckd"]','https://csi.org.in/')
on conflict (id) do nothing;

insert into drug_interactions (drug_a_id, drug_b_id, severity, mechanism, clinical_effect, management, source_note) values
('glimepiride','metoprolol','high','Beta-blocker masks adrenergic warning signs','Delayed recognition of severe hypoglycemia','Prefer non-SU agent or intensify monitoring','standard interaction references'),
('glimepiride','carvedilol','high','Beta-blocker plus sulfonylurea','Hypoglycemia symptoms masked in HF patient','Stop glimepiride in HF/CKD overlap','standard interaction references'),
('spironolactone','ramipril','high','Dual potassium retention','Hyperkalemia especially CKD','Check K/renal function; hold MRA/ACEi when K high','HF prescribing guidance'),
('aspirin','rivaroxaban','high','Antiplatelet plus anticoagulant','Major bleeding risk','Use shortest triple therapy duration','AF PCI guidance'),
('ticagrelor','rivaroxaban','high','Potent P2Y12 plus DOAC','High bleeding risk','Prefer OAC plus clopidogrel when appropriate','AF PCI guidance'),
('metformin','furosemide','moderate','Volume depletion can trigger AKI','Metformin accumulation if AKI develops','Sick-day rule and renal monitoring','renal safety references'),
('empagliflozin','furosemide','moderate','Additive natriuresis','Volume depletion or hypotension','Assess congestion/BP and adjust loop diuretic if needed','SGLT2 HF guidance'),
('pioglitazone','furosemide','high','TZD fluid retention counteracts diuresis','Worsening edema/HF','Avoid pioglitazone in HFrEF','RSSDI/HF guidance'),
('warfarin','aspirin','high','VKA plus antiplatelet','Bleeding','Use only with strong indication and INR plan','antithrombotic references'),
('heparin','aspirin','moderate','Anticoagulant plus antiplatelet','Bleeding','Use ACS protocol and monitor','ACS protocol')
on conflict (drug_a_id, drug_b_id) do nothing;

insert into hospital_formulary (drug_id, in_stock, stock_level, pharmacy_notes) select id, true, 'routine', 'Demo formulary row for Apollo Chennai assessment' from drugs on conflict (drug_id, site) do nothing;
