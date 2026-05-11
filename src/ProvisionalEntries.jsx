import React, { useState } from "react";
import { Btn, Silk, C, TODAY, daysUntil, isEligible, ANTHROPIC_KEY } from "./shared";

function ProvisionalEntries({ horses, setHorses }) {
  const [showAdd, setShowAdd] = useState(null); // horseId
  const [entry, setEntry] = useState({ venue: "", date: "", raceName: "", raceRef: "", note: "" });
  const [provisionalRaces, setProvisionalRaces] = useState([]);
  const [fetchStatus, setFetchStatus] = useState("idle");
  const [lastFetch, setLastFetch] = useState(null);
  const [showProvPaste, setShowProvPaste] = useState(false);
  const [provPasteText, setProvPasteText] = useState("");

  const handleProvParseText = async function() {
    if (!provPasteText.trim()) return;
    setFetchStatus("fetching");
    try {
      const headers = {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      };
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 5000,
          messages: [{ role: "user", content: "Parse every race from this HRI provisional summary text into a JSON array. Return ONLY the raw JSON array with no markdown. Each race needs: id as ps_N, source as provisional, meetingRef like Limerick 55, raceRef like Race A, venue, date in YYYY-MM-DD format, raceName, discipline, grade, distanceFurlongs as number, prizeMoney as number, forecastGoing, entryDeadline in YYYY-MM-DDTHH:MM format.\n\nTEXT:\n" + provPasteText }],
        }),
      });
      const data = await res.json();
      const txt = (data.content || []).filter(function(b){return b.type==="text";}).map(function(b){return b.text;}).join("").trim();
      var s=txt.indexOf("["),e=txt.lastIndexOf("]");var match=s>=0&&e>s?[txt.slice(s,e+1)]:null;
      if (!match) throw new Error("No races found");
      const parsed = JSON.parse(match[0]);
      setProvisionalRaces(parsed);
      setLastFetch(new Date().toISOString());
      setFetchStatus("done");
      setShowProvPaste(false);
      setProvPasteText("");
    } catch (err) {
      console.error(err);
      setFetchStatus("error");
    }
  };

  const handleProvPDFUpload = async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFetchStatus("fetching");
    e.target.value = "";
    try {
      const reader = new FileReader();
      reader.onload = async function(ev) {
        const base64 = ev.target.result.split(",")[1];
        const headers = {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        };
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 5000,
            messages: [{ role: "user", content: [
              { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
              { type: "text", text: "Parse every race from this HRI provisional summary PDF into a JSON array. Return ONLY the raw JSON array. Each race needs: id as ps_N, source as provisional, meetingRef like Limerick 55, raceRef like Race A, venue, date in YYYY-MM-DD format, raceName, discipline, grade, distanceFurlongs as number, prizeMoney as number, forecastGoing, entryDeadline in YYYY-MM-DDTHH:MM format." }
            ]}],
          }),
        });
        const data = await res.json();
        const txt = (data.content || []).filter(function(b){return b.type==="text";}).map(function(b){return b.text;}).join("").trim();
        const arr = (function(){var s=txt.indexOf("[");var e=txt.lastIndexOf("]");return s>=0&&e>s?[null,txt.slice(s+1,e)]:null;})();
        if (!arr) throw new Error("No races found");
        const parsed = JSON.parse(arr[0]);
        setProvisionalRaces(parsed);
        setLastFetch(new Date().toISOString());
        setFetchStatus("done");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setFetchStatus("error");
    }
  };

  const fetchProvisional = async function() {
    setFetchStatus("fetching");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 5000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          system: "Parse HRI provisional summary PDFs into a JSON array. Return ONLY raw JSON array, no markdown. Each race needs these fields: id, source set to provisional, meetingRef like Limerick 55, raceRef like Race A, venue, date in YYYY-MM-DD format, raceName, discipline, grade, distanceFurlongs as number, prizeMoney as number, forecastGoing, entryDeadline in YYYY-MM-DDTHH:MM format.",
          messages: [{ role: "user", content: "Search for HRI provisional race summaries at hri-ras.ie/provisional-summaries and find the most recent provisional summary documents. Fetch and parse all races into a JSON array. If you cannot find PDFs directly, search for HRI provisional summaries 2026 Ireland. Return only the JSON array with no markdown." }]
        })
      });
      const data = await res.json();
      const text = data.content?.filter(function(b){return b.type==="text";}).map(function(b){return b.text;}).join("").trim();
      var s=text.indexOf("["),e=text.lastIndexOf("]");var match=s>=0&&e>s?[text.slice(s,e+1)]:null;
      if (!match) throw new Error("No races");
      setProvisionalRaces(JSON.parse(match[0]));
      setLastFetch(new Date().toISOString());
      setFetchStatus("done");
    } catch (e) { console.error(e); setFetchStatus("error"); }
  };

  const addEntry = function(horseId) {
    if (!entry.venue || !entry.raceName) return;
    setHorses(function(prev){return prev.map;}(function(h){return h.id;} === horseId ? { ...h, provisionalEntries: [...(h.provisionalEntries || []), { ...entry, id: "pe_" + Date.now() }] } : h));
    setEntry({ venue: "", date: "", raceName: "", raceRef: "", note: "" });
    setShowAdd(null);
  };

  const removeEntry = function(horseId,entryId) {
    setHorses(function(prev){return prev.map;}(function(h){return h.id;} === horseId ? { ...h, provisionalEntries: (h.provisionalEntries || []).filter(function(e){return e.id;} !== entryId) } : h));
  };

  const allProvisional = horses.reduce(function(acc, h) { return acc.concat((h.provisionalEntries || []).map(function(e) { return Object.assign({}, e, { horse: h }); })); }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Provisional Entries</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Planning targets before official entries — visible to owners in their portal</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" onClick={fetchProvisional} disabled={fetchStatus === "fetching"} style={{ fontSize: 12 }}>
            {fetchStatus === "fetching" ? "⟳ Fetching…" : "⟳ Fetch HRI Provisional Summaries"}
          </Btn>
        </div>
      </div>

      
      <div style={{ background: C.card, border: "1px solid "+C.border, borderRadius: 14, padding: "14px 18px", marginBottom: 16, boxShadow: C.shadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: lastFetch || provisionalRaces.length > 0 ? 12 : 0 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>HRI Provisional Summaries</div>
            <div style={{ fontSize: 12, color: C.textMid }}>
              {lastFetch ? `Last fetched: ${new Date(lastFetch).toLocaleString("en-IE", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : "hri-ras.ie/provisional-summaries — use these to plan medication courses in advance"}
            </div>
          </div>
          <Btn onClick={function(){return setShowProvPaste(!showProvPaste;})} disabled={fetchStatus === "fetching"} style={{ fontSize: 12, padding: "8px 16px" }}>
            {fetchStatus === "fetching" ? "Parsing..." : "📋 Paste Provisional Summary"}
          </Btn>
        </div>
        {showProvPaste && (
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>Paste Provisional Summary Text</div>
            <div style={{ fontSize: 12, color: C.textMid, marginBottom: 10, lineHeight: 1.6 }}>Open the HRI provisional summary PDF, press Ctrl+A then Ctrl+C, then paste below.</div>
            <textarea
              value={provPasteText}
              onChange={function(e){setProvPasteText(e.target.value);}}
              placeholder="Paste provisional summary text here..."
              rows={6}
              style={{ width: "100%", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 9, padding: "10px 12px", color: C.text, fontSize: 12, fontFamily: "inherit", lineHeight: 1.6, resize: "vertical", outline: "none", marginBottom: 10 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={handleProvParseText} disabled={!provPasteText.trim() || fetchStatus === "fetching"} style={{ flex: 1, justifyContent: "center" }}>
                {fetchStatus === "fetching" ? "Parsing..." : "Parse Races"}
              </Btn>
              <Btn variant="ghost" onClick={function(){ setShowProvPaste(false); setProvPasteText(""); }} style={{ fontSize: 12 }}>Cancel</Btn>
            </div>
          </div>
        )}

        {provisionalRaces.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {provisionalRaces.slice(0, 8).map(function(r,i){return(
              <div key={i} style={{ display: "flex", gap: 12, padding: "8px 10px", background: C.cardOff, borderRadius: 8, border: "1px solid "+C.border, fontSize: 12, alignItems: "center" }}>
                <span style={{ fontWeight: 700, color: C.navy, minWidth: 80 }}>{r.meetingRef}</span>
                <span style={{ color: C.textMid, minWidth: 60 }}>{r.raceRef}</span>
                <span style={{ fontWeight: 600, color: C.text, flex: 1 }}>{r.raceName}</span>
                <span style={{ color: C.textMid }}>{r.venue}</span>
                <span style={{ color: C.gold, fontWeight: 700 }}>€{r.prizeMoney >= 1000 ? (Math.round(r.Math.floor(prizeMoney * 0.001))) + "k" : r.prizeMoney}</span>
                <span style={{ color: C.textMid }}>{new Date(r.date).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}</span>
              </div>
            ))}
            {provisionalRaces.length > 8 && <div style={{ fontSize: 12, color: C.textMid, padding: "4px 0" }}>+ {provisionalRaces.length - 8} more races</div>}
          </div>
        )}
        {fetchStatus === "error" && <div style={{ fontSize: 12, color: C.red, fontWeight: 600, marginTop: 8 }}>✕ Failed to fetch — try again</div>}
        {fetchStatus === "done" && provisionalRaces.length === 0 && <div style={{ fontSize: 12, color: C.textMid, marginTop: 8 }}>No races found in provisional summaries</div>}
      </div>

      
      {horses.filter(function(h){return h.status;} !== "Inactive").map(function(horse){
        const entries = horse.provisionalEntries || [];
        const isAdding = showAdd === horse.id;
        return (
          <div key={horse.id} style={{ background: C.card, border: "1px solid "+C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 12, boxShadow: C.shadow }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: entries.length > 0 || isAdding ? 12 : 0 }}>
              <Silk silk={horse.silk} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{horse.name}</div>
                <div style={{ fontSize: 12, color: C.textMid }}>{horse.owner} · {entries.length} provisional target{entries.length !== 1 ? "s" : ""}</div>
              </div>
              <Btn variant="gold" onClick={function(){return setShowAdd(isAdding ? null : horse.id;})} style={{ fontSize: 12, padding: "6px 14px" }}>
                {isAdding ? "Cancel" : "+ Add Target"}
              </Btn>
            </div>

            
            {entries.map(function(e){return(
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.goldBg, border: `1px solid ${C.gold}30`, borderLeft: `3px solid ${C.gold}`, borderRadius: 10, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{e.raceName}</span>
                    {e.raceRef && <Tag color={C.navy} bg="rgba(10,22,40,0.07)">{e.raceRef}</Tag>}
                    <Tag color={C.gold}>Provisional</Tag>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                    <span>📍 {e.venue}</span>
                    {e.date && <span>📅 {new Date(e.date).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}</span>}
                    {e.date && daysUntil(e.date) && <span style={{ color: daysUntil(e.date) <= 16 ? C.amber : C.textMid, fontWeight: daysUntil(e.date) <= 16 ? 700 : 400 }}>{daysUntil(e.date)} days away</span>}
                  </div>
                  {e.note && <div style={{ fontSize: 12, color: C.textMid, fontStyle: "italic", marginTop: 4 }}>💬 {e.note}</div>}
                </div>
                <Btn variant="red" onClick={function(){return removeEntry(horse.id;}, e.id)} style={{ padding: "5px 10px", fontSize: 11 }}>✕</Btn>
              </div>
            ))}

            
            {isAdding && (
              <div style={{ background: C.cardOff, border: "1px solid "+C.border, borderRadius: 10, padding: "14px 16px", marginTop: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Add Provisional Target for {horse.name}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  {[
                    { key: "raceName", label: "Race Name", placeholder: "e.g. Mares Handicap Hurdle", full: true },
                    { key: "venue", label: "Venue", placeholder: "e.g. Navan" },
                    { key: "date", label: "Date", type: "date" },
                    { key: "raceRef", label: "Meeting Ref", placeholder: "e.g. Limerick 55 Race A" },
                  ].map(function(item){var key=item.key,label=item.label,placeholder=item.placeholder,type=item.type,full=item.full;return(
                    <div key={key} style={{ gridColumn: full ? "1 / -1" : "auto" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                      <input type={type || "text"} placeholder={placeholder} value={entry[key]} onChange={function(e){setEntry(function(p) { return Object.assign({}, p, { [key]: e.target.value }); })} style={{ width: "100%", background: C.card, border: "1px solid "+C.border, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }} />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Trainer Note (visible to owner)</div>
                  <input type="text" placeholder="e.g. If ground stays soft" value={entry.note} onChange={function(e){setEntry(function(p) { return Object.assign({}, p, { note: e.target.value }); })} style={{ width: "100%", background: C.card, border: "1px solid "+C.border, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={function(){return addEntry(horse.id;})}>Save Target</Btn>
                  <Btn variant="ghost" onClick={function(){return setShowAdd(null;})}>Cancel</Btn>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {allProvisional.length > 0 && (
        <div style={{ background: C.card, border: "1px solid "+C.border, borderRadius: 12, padding: "14px 18px", marginTop: 8, boxShadow: C.shadow }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>All Provisional Targets — by date</div>
          {[...allProvisional].filter(function(e){return e.date;}).sort(function(a,b){return new Date(a.date) - new Date(b.date)).map(function(e,i){return(
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <Silk silk={e.horse.silk} size={24} />
              <div style={{ flex: 1, fontSize: 13 }}>
                <span style={{ fontWeight: 700, color: C.text }}>{e.horse.name}</span>
                <span style={{ color: C.textMid, marginLeft: 8 }}>{e.raceName} · {e.venue}</span>
                {e.raceRef && <span style={{ color: C.textDim, marginLeft: 6, fontSize: 11 }}>{e.raceRef}</span>}
              </div>
              <span style={{ fontSize: 12, color: C.textMid }}>{new Date(e.date).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: daysUntil(e.date) <= 16 ? C.amber : C.textMid }}>{daysUntil(e.date)} days</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── RACE PLANNER ─────────────────────────────────────────────────────────────

export default ProvisionalEntries;
