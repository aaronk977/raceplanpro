// api/parse-conditions.js
// Server-side parser for HRI "Upcoming Race Conditions" PDFs.
// Reads the 3-column layout in correct order, splits into races,
// and extracts structured conditions. Produces data + confidence only —
// it does NOT decide eligibility. Uncertain items go to needs_review.
// REQUIRES: pdfjs-dist (already added to package.json)

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const PAGE_HEADER = "Upcoming Race Conditions Week Commencing";
const IRISH_TRACKS = [
  "ROSCOMMON","SLIGO","LIMERICK","LEOPARDSTOWN","FAIRYHOUSE","GOWRAN PARK",
  "DOWNPATRICK","CORK","DOWN ROYAL","CURRAGH","NAAS","NAVAN","BELLEWSTOWN",
  "BALLINROBE","CLONMEL","DUNDALK","GALWAY","KILLARNEY","LISTOWEL","TIPPERARY",
  "THURLES","TRAMORE","WEXFORD","PUNCHESTOWN","KILBEGGAN","LAYTOWN",
];
const WORD_NUM = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10 };

const numFrom = (tok) => {
  if (!tok) return null;
  tok = tok.trim().toLowerCase();
  if (tok in WORD_NUM) return WORD_NUM[tok];
  if (/^\d+$/.test(tok)) return parseInt(tok, 10);
  return null;
};

async function extractColumns(pdfData, nCols = 3, margin = 26) {
  const doc = await pdfjsLib.getDocument({ data: pdfData }).promise;
  const pageTexts = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: 1 });
    const width = viewport.width;
    const content = await page.getTextContent();
    const usable = width - 2 * margin;
    const colW = usable / nCols;
    const cols = Array.from({ length: nCols }, () => []);
    for (const item of content.items) {
      const x = item.transform[4];
      const y = item.transform[5];
      let ci = Math.floor((x - margin) / colW);
      if (ci < 0) ci = 0;
      if (ci >= nCols) ci = nCols - 1;
      cols[ci].push({ x, y, str: item.str });
    }
    const colStrings = cols.map((items) => {
      items.sort((a, b) => (b.y - a.y) || (a.x - b.x));
      const lines = [];
      let curY = null, cur = [];
      for (const it of items) {
        if (curY === null || Math.abs(it.y - curY) > 3) {
          if (cur.length) lines.push(cur.join(" "));
          cur = [it.str];
          curY = it.y;
        } else {
          cur.push(it.str);
        }
      }
      if (cur.length) lines.push(cur.join(" "));
      return lines.join("\n");
    });
    pageTexts.push(colStrings.join("\n"));
  }
  return pageTexts.join("\n")
    .split("\n")
    .filter((line) => !line.includes(PAGE_HEADER)
      && !/^\s*onditions Week Commencing/.test(line)
      && !/^\s*Upcoming Race Co\s*$/.test(line))
    .join("\n");
}

function segment(text) {
  const meetingRe = new RegExp("^\\s*(" + IRISH_TRACKS.join("|") + ")\\s*$", "gm");
  const raceRe = /^\s*([A-H])\s+(\d{1,2}:\d{2}\s*[AP]M)\s*$/gm;
  const anchors = [];
  let m;
  while ((m = meetingRe.exec(text)) !== null) anchors.push({ pos: m.index, track: m[1] });
  const meetings = [];
  for (let i = 0; i < anchors.length; i++) {
    const start = anchors[i].pos;
    const end = i + 1 < anchors.length ? anchors[i + 1].pos : text.length;
    const block = text.slice(start, end);
    const races = [];
    const markers = [];
    let r;
    raceRe.lastIndex = 0;
    while ((r = raceRe.exec(block)) !== null) {
      markers.push({ idx: r.index, letter: r[1], time: r[2].replace(/\s/g, "") });
    }
    for (let j = 0; j < markers.length; j++) {
      const s = markers[j].idx;
      const e = j + 1 < markers.length ? markers[j + 1].idx : block.length;
      races.push({ letter: markers[j].letter, time: markers[j].time, raw: block.slice(s, e).trim() });
    }
    const head = markers.length ? block.slice(0, markers[0].idx) : block;
    const closeM = head.match(/CLOSING 12 NOON\s+([A-Z]+\s+\d+\w*\s+\w+)/i);
    meetings.push({ track: anchors[i].track, closing: closeM ? closeM[1] : null, races });
  }
  return meetings;
}

function parseDistance(raw) {
  const m = raw.match(/About\s+([\d\s\w]+?)(?:\n|€|Weights|Penalties)/);
  if (!m) return null;
  const seg = m[1];
  const miles = seg.match(/(\d+)\s+mile/);
  const furl = seg.match(/(\d+)\s+furlong/);
  const yards = seg.match(/(\d+)\s+yard/);
  let f = 0;
  if (miles) f += parseInt(miles[1]) * 8;
  if (furl) f += parseInt(furl[1]);
  if (yards) f += parseInt(yards[1]) / 220;
  return f ? Math.round(f * 100) / 100 : null;
}

function extractConditions(race) {
  const raw = race.raw;
  const low = raw.toLowerCase();
  const lines = raw.split("\n").slice(1).map((l) => l.trim()).filter(Boolean);
  const name = lines[0] || "";
  const c = {};
  const flags = [];
  const review = [];

  if (low.includes("hurdle")) c.race_code = "hurdle";
  else if (low.includes("steeplechase")) c.race_code = "chase";
  else if (low.includes("i.n.h. flat") || low.includes("flat race") || low.includes("bumper")) c.race_code = "nh_flat";
  else c.race_code = "flat";

  let am;
  if ((am = low.match(/(\w+)\s+years?\s+old\s+only/))) {
    const n = numFrom(am[1]); if (n) { c.age_min = n; c.age_max = n; }
  } else if ((am = low.match(/(\w+)\s+years?\s+old\s+and\s+upwards/))) {
    const n = numFrom(am[1]); if (n) c.age_min = n;
  }

  if (low.includes("mares only")) c.sex_allowed = ["Mare"];
  else if (low.includes("fillies only")) c.sex_allowed = ["Filly"];

  if (low.includes("novice hurdle")) { c.novice = "hurdle"; flags.push("novice_hurdle"); }
  else if (low.includes("novice steeplechase") || low.includes("beginners steeplechase")) { c.novice = "chase"; flags.push("novice_chase"); }

  if (low.includes("maiden")) { c.maiden = true; flags.push("maiden"); }

  let rr;
  if ((rr = low.match(/rated\s+0\s*-\s*(\d+)/))) c.max_mark = parseInt(rr[1]);
  if ((rr = low.match(/rated\s+(\d+)\s+or\s+less/))) c.max_mark = parseInt(rr[1]);
  const band = raw.match(/\((\d+)\s*=\s*\d+st/);
  if (band) c.handicap_band_top = parseInt(band[1]);

  let rc;
  if ((rc = low.match(/run\s+(?:at\s+least\s+)?(\w+)\s+(?:times|or more)/))) {
    const n = numFrom(rc[1]); if (n) { c.min_total_runs = n; flags.push("min_runs:" + n); }
  }
  if (low.includes("run at least twice")) c.min_total_runs = 2;

  if (low.includes("not won a steeplechase")) c.not_won_chase = true;
  if (low.includes("not won a hurdle")) c.not_won_hurdle = true;
  if (low.includes("have not won a race under any n.h. rules or rules of racing")) c.not_won_any = true;

  if (low.includes("ebf eligible") || low.includes("irish stallion farms ebf") || low.includes("ebf maiden")) {
    c.ebf_required = true; flags.push("ebf");
  }

  const dist = parseDistance(raw);
  if (dist) c.distance_furlongs = dist;
  const pm = raw.match(/of\s+€([\d,]+)/);
  if (pm) c.prize_eur = parseInt(pm[1].replace(/,/g, ""));

  if (!c.race_code) review.push("race_code");
  if (!c.age_min) review.push("age_min");
  if (/median|auction|claiming|balloting/.test(low)) review.push("complex_clause");

  const confidence = Math.round((1 - 0.15 * review.length) * 100) / 100;
  return { race_letter: race.letter, race_time: race.time, race_name: name,
           conditions: c, flags, needs_review: review, confidence };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { pdfBase64 } = req.body || {};
    if (!pdfBase64) return res.status(400).json({ error: "No pdfBase64 in request body" });
    const pdfData = Uint8Array.from(Buffer.from(pdfBase64, "base64"));
    const text = await extractColumns(pdfData);
    const meetings = segment(text);
    const result = meetings.map((mtg) => ({
      track: mtg.track,
      closing: mtg.closing,
      races: mtg.races.map(extractConditions),
    }));
    const totalRaces = result.reduce((s, m) => s + m.races.length, 0);
    const autoApprove = result.reduce((s, m) => s + m.races.filter((r) => r.confidence >= 1).length, 0);
    return res.status(200).json({
      summary: { meetings: result.length, races: totalRaces, auto_approve: autoApprove,
                 needs_review: totalRaces - autoApprove },
      meetings: result,
    });
  } catch (err) {
    console.error("parse-conditions error:", err);
    return res.status(500).json({ error: err.message });
  }
}
