// Official EHSLC / IHRB Detection Times
// Source: ihrb.ie/medicines-register
// Detection times in HOURS unless marked as days. These are DETECTION times,
// not withdrawal times - trainers must add a safety margin per their vet.
// "<=48^" entries: BHA rule - prohibited substance must not be given on race day.

var DETECTION_TIMES = [
  { substance: "Acepromazine", brand: "Sedalin (Vetoquinol)", dose: "0.15mg/kg single dose", route: "Oral", hours: 72 },
  { substance: "Altrenogest", brand: "Regumate Equine (MSD)", dose: "44ug/kg 10 days once daily", route: "Oral", hours: 288 },
  { substance: "Butorphanol", brand: "Torbugesic (Fort Dodge)", dose: "100ug/kg single dose", route: "IV", hours: 72 },
  { substance: "Butyl Scopolamine/Dipyrone", brand: "Buscopan Compositum (Boehringer)", dose: "0.2mg/kg + 25mg/kg single dose", route: "IV", hours: 72 },
  { substance: "Butyl Scopolamine", brand: "Buscopan (Boehringer)", dose: "0.3mg/kg single dose", route: "IV", hours: 48 },
  { substance: "Carprofen", brand: "Rimadyl (Pfizer)", dose: "0.7mg/kg single dose", route: "IV", hours: 264 },
  { substance: "Cetirizine", brand: "Allacan (Bristol)", dose: "190mg twice daily 4.5 days", route: "Oral", hours: 96 },
  { substance: "Ciclesonide", brand: "Aservo Equihaler", dose: "5.5mg/day 5 days then 4.1mg/day 5 days", route: "Inhalation", hours: 120 },
  { substance: "Clenbuterol", brand: "Ventipulmin Syrup (Boehringer)", dose: "1.6ug/kg/day 10 days", route: "Oral", hours: 312 },
  { substance: "Clenbuterol", brand: "Ventipulmin Injection (Boehringer)", dose: "0.3ug/kg/day 5 days", route: "Nebulised", hours: 144 },
  { substance: "Clodronate", brand: "Osphos (Dechra)", dose: "1.53mg/kg single injection", route: "IM", hours: 720, note: "30 days" },
  { substance: "Dantrolene", brand: "Dantrium", dose: "500mg 3 days once daily", route: "Oral", hours: 48 },
  { substance: "Dembrexine", brand: "Sputolysin (Boehringer)", dose: "0.3mg/kg 9 doses 12h intervals", route: "Oral", hours: 96 },
  { substance: "Detomidine", brand: "Domosedan (Orion)", dose: "0.02mg/kg single dose", route: "IV", hours: 48 },
  { substance: "Detomidine/Butorphanol", brand: "Domosedan + Torbugesic", dose: "10ug/kg then 25ug/kg", route: "IV", hours: 72 },
  { substance: "Dexamethasone isonicotinate", brand: "Voren (Boehringer)", dose: "0.03mg/kg single dose", route: "IM", hours: 336 },
  { substance: "Dexamethasone sodium phosphate", brand: "Dexadreson (Intervet)", dose: "0.06mg/kg single dose", route: "IV", hours: 120 },
  { substance: "Dipyrone", brand: "Vetalgin (Intervet)", dose: "30mg/kg single dose", route: "IV", hours: 72 },
  { substance: "Eltenac", brand: "Telzenac (Schering Plough)", dose: "0.5mg/kg 5 days once daily", route: "IV", hours: 192 },
  { substance: "Firocoxib", brand: "Equioxx (Merial)", dose: "100ug/kg 7 days once daily", route: "Oral", hours: 360, note: "15 days" },
  { substance: "Flunixin", brand: "Finadyne (Schering Plough)", dose: "1mg/kg single dose", route: "IV", hours: 144 },
  { substance: "Furosemide", brand: "Dimazon (Intervet)", dose: "1mg/kg single dose", route: "IV", hours: 48 },
  { substance: "Hydroxyzine", brand: "Atarax (Alliance)", dose: "500mg twice daily 4.5 days", route: "Oral", hours: 96 },
  { substance: "Ipratropium", brand: "Atrovent (Boehringer)", dose: "5.5ug/kg/day 3 days", route: "Nebulised", hours: 120 },
  { substance: "Ketoprofen", brand: "Ketofen (Merial)", dose: "2.2mg/kg 5 days once daily", route: "IV", hours: 96 },
  { substance: "Lidocaine", brand: "Norocaine (Norbrook)", dose: "300mg/15mL single dose", route: "SC", hours: 72 },
  { substance: "Meclofenamic acid", brand: "Sigma (not commercial)", dose: "2.2mg/kg single dose", route: "IV", hours: 48 },
  { substance: "Meclofenamic acid", brand: "Dynoton (Biove)", dose: "4mg/kg 5 days once daily", route: "Oral", hours: 120 },
  { substance: "Meloxicam", brand: "Metacam (Boehringer)", dose: "0.6mg/kg 14 days once daily", route: "Oral", hours: 72 },
  { substance: "Mepivacaine", brand: "Intra-Epicaine (Arnolds)", dose: "2mL/40mg single dose distal limb", route: "SC", hours: 72 },
  { substance: "Mepivacaine", brand: "Intra-Epicaine (Arnolds)", dose: "8mL/160mg single dose neck", route: "SC", hours: 72 },
  { substance: "Misoprostol", brand: "Cytotec", dose: "5ug/kg 14 days twice daily", route: "Oral", hours: 48 },
  { substance: "Naproxen", brand: "Naprosyn (Roche)", dose: "10mg/kg 5 days once daily", route: "Oral", hours: 360, note: "15 days+" },
  { substance: "Omeprazole", brand: "Gastrogard (Merial)", dose: "1mg/kg 28 days once daily", route: "Oral", hours: 48 },
  { substance: "Phenylbutazone", brand: "Equipalazone (Arnolds/Dechra)", dose: "8.8mg/kg single dose / courses", route: "Oral/IV", hours: 168 },
  { substance: "Prednisolone", brand: "Prednidale 25mg (Dechra)", dose: "1mg/kg single dose", route: "Oral", hours: 48 },
  { substance: "Procaine benzylpenicillin", brand: "Depocillin (MSD)", dose: "12mg/kg 5 days", route: "IM", hours: 240 },
  { substance: "Romifidine", brand: "Sedivet (Boehringer)", dose: "80ug/kg single dose", route: "IV", hours: 60 },
  { substance: "Romifidine/Butorphanol", brand: "Sedivet + Torbugesic", dose: "60ug/kg then 25ug/kg", route: "IV", hours: 72 },
  { substance: "Salbutamol", brand: "Ventolin Evohaler (Allen & Hansburys)", dose: "5x100ug actuations 2 days", route: "Inhaled", hours: 72 },
  { substance: "Tiludronate", brand: "Tildren (Ceva)", dose: "0.1mg/kg 10 days", route: "IV", hours: 720, note: "30 days" },
  { substance: "Vedaprofen", brand: "Quadrisol (Intervet)", dose: "2mg/kg single dose", route: "IV", hours: 96 },
  { substance: "Xylazine", brand: "Chanazine", dose: "0.4mg/kg single dose", route: "IV", hours: 72 },
];

// Routes of administration per Rule 148
var ROUTES = [
  { code: "O", label: "Oral" },
  { code: "T", label: "Topical" },
  { code: "I/V", label: "Intravenous" },
  { code: "I/M", label: "Intramuscular" },
  { code: "S/C", label: "Subcutaneous" },
  { code: "I/A", label: "Intraarticular" },
];

export { DETECTION_TIMES, ROUTES };
