import React, { useState, useEffect, useMemo } from "react";
import { Btn, C } from "./shared";

/*
  RacingExpenses — wired into RacePlan Pro.
  Props: { user, supabase, settings, setSettings, onNavigate }.
  Rates live in settings.racingRates. Sheets save to racing_expenses (user_id + week_start).
  Working sheet auto-persists to localStorage per week so it survives tab switches / reloads.
  Parsing goes through /api/claude.
*/

var RATE_DEFAULTS = {
  dayMeeting: 60, eveningMeeting: 60, sunBankHolSatEve: 75, overnight: 100, dundalkEvening: 110,
  taxFree10: 46.17, taxFree5: 19.25
};

var BANK_HOLIDAYS = ["2026-01-01","2026-02-02","2026-03-17","2026-04-06","2026-05-04","2026-06-01","2026-08-03","2026-10-26","2026-12-25","2026-12-26"];
var DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function parseISO(iso){ return new Date(iso + "T00:00:00"); }
function fmtDate(iso){ if(!iso) return "—"; var d=parseISO(iso); return DAY_NAMES[d.getDay()]+" "+String(d.getDate()).padStart(2,"0")+"/"+String(d.getMonth()+1).padStart(2,"0"); }
function euro(n){ return "€"+(Number(n)||0).toFixed(2); }
function currentMonday(){ var d=new Date(); var off=(d.getDay()+6)%7; d.setDate(d.getDate()-off); return d.toISOString().slice(0,10); }
function hoursLabel(t){ return t==="10"?"10+":t==="5"?"5–10":"<5"; }

function autoRate(row, rates){
  if(row.overnight) return { rate: rates.overnight, label: "Overnight" };
  var dow = row.date ? parseISO(row.date).getDay() : 1;
  var sunOrBH = dow===0 || BANK_HOLIDAYS.indexOf(row.date)>=0;
  var isDundalk = (row.venue||"").toLowerCase().indexOf("dundalk")>=0;
  if(isDundalk && row.evening) return { rate: rates.dundalkEvening, label: "Dundalk evening" };
  if(sunOrBH) return { rate: rates.sunBankHolSatEve, label: dow===0?"Sunday":"Bank holiday" };
  if(dow===6) return row.evening ? { rate: rates.sunBankHolSatEve, label:"Sat evening" } : { rate: rates.dayMeeting, label:"Sat day" };
  return row.evening ? { rate: rates.eveningMeeting, label:"Evening" } : { rate: rates.dayMeeting, label:"Day meeting" };
}
function taxFreeFor(tier, rates){ return tier==="10"?rates.taxFree10:tier==="5"?rates.taxFree5:0; }

function weekContext(mondayISO){
  var start=parseISO(mondayISO);
  var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var wd=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  var dates=[];
  for(var i=0;i<7;i++){ var d=new Date(start); d.setDate(start.getDate()+i); dates.push({iso:d.toISOString().slice(0,10),label:wd[i]+" "+d.getDate()+" "+months[d.getMonth()]}); }
  return { year:start.getFullYear(), month:start.getMonth()+1, dates:dates };
}

function localParse(text, year, month){
  var cleaned=text.replace(/racing this week/ig," ").replace(/\s+/g," ").trim();
  var segs=cleaned.split(/\.+/).map(function(s){return s.trim();}).filter(Boolean);
  var dayRe=/\b(mon|tues?|weds?|thur?s?|fri|sat|sun)\b/i;
  var ordRe=/\b(\d{1,2})(?:st|nd|rd|th)\b/i;
  var rows=[];
  segs.forEach(function(seg){
    var dm=seg.match(dayRe); var om=seg.match(ordRe);
    if(!dm && !om) return;
    var splitIdx=dm?dm.index:om.index;
    var namesPart=seg.slice(0,splitIdx).trim();
    var venue= om?seg.slice(om.index+om[0].length): dm?seg.slice(dm.index+dm[0].length):"";
    venue=venue.replace(/^[-,\s]+/,"").trim(); venue=venue.charAt(0).toUpperCase()+venue.slice(1);
    var dayNum=om?parseInt(om[1],10):null;
    var iso=dayNum?(year+"-"+String(month).padStart(2,"0")+"-"+String(dayNum).padStart(2,"0")):"";
    var evening=/evening|\beve\b/i.test(seg);
    var overnight=/overnight|over night/i.test(seg);
    namesPart.split(/,|\band\b|&/i).map(function(n){return n.trim();}).filter(Boolean).forEach(function(nm){
      rows.push({ employee:nm, date:iso, venue:venue, evening:evening, overnight:overnight });
    });
  });
  return rows;
}

async function aiParse(rawText, ctx){
  var refList=ctx.dates.map(function(d){return d.label+" = "+d.iso;}).join("\n");
  var prompt="Convert a racing yard's informal staff message into rows for a weekly racing-expenses sheet.\n\nPayroll week dates:\n"+refList+"\n\nRules:\n- One object PER PERSON per meeting.\n- Use the explicit day-of-month when given (month "+ctx.month+"/"+ctx.year+"); else map the weekday to the list. Messages may wrap across lines.\n- evening:true only if clearly an evening meeting. overnight:true only if it says overnight.\n- Keep names exactly as written. Venue = racecourse, title-cased. Ignore lines like \"Racing this week\".\n\nMessage:\n\"\"\"\n"+rawText+"\n\"\"\"\n\nReturn ONLY a JSON array, no prose, no markdown. Each item: {\"employee\":string,\"date\":\"YYYY-MM-DD\",\"venue\":string,\"evening\":boolean,\"overnight\":boolean}";
  var res=await fetch("/api/claude",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:prompt}] }) });
  if(!res.ok) throw new Error("status "+res.status);
  var data=await res.json();
  var text=(data.content||[]).filter(function(b){return b.type==="text";}).map(function(b){return b.text;}).join("\n");
  return JSON.parse(text.replace(/```json/gi,"").replace(/```/g,"").trim());
}

var RID = 1;

function RacingExpenses(props){
  var settings = props.settings || {};
  var setSettings = props.setSettings;
  var user = props.user;
  var supabase = props.supabase;

  var rates = Object.assign({}, RATE_DEFAULTS, settings.racingRates || {});

  var mondayState = useState(currentMonday()); var monday=mondayState[0]; var setMonday=mondayState[1];
  var rawState = useState(""); var rawText=rawState[0]; var setRawText=rawState[1];
  var rowsState = useState([]); var rows=rowsState[0]; var setRows=rowsState[1];
  var loadingState = useState(false); var loading=loadingState[0]; var setLoading=loadingState[1];
  var savingState = useState(false); var saving=savingState[0]; var setSaving=savingState[1];
  var errState = useState(""); var error=errState[0]; var setError=errState[1];
  var infoState = useState(""); var info=infoState[0]; var setInfo=infoState[1];
  var settingsOpenState = useState(false); var settingsOpen=settingsOpenState[0]; var setSettingsOpen=settingsOpenState[1];
  var notesState = useState(""); var notes=notesState[0]; var setNotes=notesState[1];
  var draftState = useState(rates); var rateDraft=draftState[0]; var setRateDraft=draftState[1];
  var hydratedState = useState(false); var hydrated=hydratedState[0]; var setHydrated=hydratedState[1];

  function draftKey(){ return "rpp_expenses_" + (user ? user.id : "anon") + "_" + monday; }

  function bumpRID(list){ list.forEach(function(r){ if(typeof r.id==="number" && r.id>=RID) RID=r.id+1; }); }

  // Load: prefer the local working draft, else the saved week from the DB.
  useEffect(function(){
    if(!user) return;
    setHydrated(false);
    try {
      var d = localStorage.getItem(draftKey());
      if(d){
        var p = JSON.parse(d);
        var dr = p.rows || [];
        bumpRID(dr);
        setRows(dr); setNotes(p.notes || "");
        setHydrated(true);
        return;
      }
    } catch(e){}
    if(!supabase){ setRows([]); setNotes(""); setHydrated(true); return; }
    supabase.from("racing_expenses").select("*").eq("user_id", user.id).eq("week_start", monday)
      .then(function(res){
        if(res.data && res.data.length){
          var mapped = res.data.map(function(r){
            return { id: RID++, date: r.work_date, employee: r.employee, venue: r.venue||"",
              evening: !!r.evening, overnight: !!r.overnight, tier: r.hours_tier||"10",
              manualRate: !!r.manual_rate, rateOverride: r.manual_rate ? String(r.rate) : "" };
          });
          setRows(mapped);
          setNotes(res.data[0] && res.data[0].notes ? res.data[0].notes : "");
        } else { setRows([]); setNotes(""); }
        setHydrated(true);
      });
  }, [user, monday]);

  // Auto-save the working draft to this device (per week)
  useEffect(function(){
    if(!hydrated || !user) return;
    try { localStorage.setItem(draftKey(), JSON.stringify({ rows: rows, notes: notes })); } catch(e){}
  }, [rows, notes, hydrated, user, monday]);

  var computed = useMemo(function(){
    return rows.map(function(r){
      var auto = autoRate(r, rates);
      var rate = r.manualRate ? (Number(r.rateOverride)||0) : auto.rate;
      var tf = taxFreeFor(r.tier, rates);
      return Object.assign({}, r, { autoLabel: auto.label, rate: rate, tf: tf, taxable: Math.max(0, rate-tf) });
    });
  }, [rows, settings]);

  var totals = useMemo(function(){
    return computed.reduce(function(a,r){ return { rate:a.rate+r.rate, tf:a.tf+r.tf, taxable:a.taxable+r.taxable }; }, { rate:0, tf:0, taxable:0 });
  }, [computed]);

  function addParsed(parsed){
    var newRows = parsed.filter(function(p){return p.employee;}).map(function(p){
      return { id: RID++, date: p.date||monday, employee: p.employee, venue: p.venue||"",
        evening: !!p.evening, overnight: !!p.overnight, tier: "10", manualRate: false, rateOverride: "" };
    });
    setRows(function(prev){ return prev.concat(newRows); });
    return newRows.length;
  }

  var handleParse = async function(){
    setError(""); setInfo("");
    if(!rawText.trim()){ setError("Paste the week's racing messages first."); return; }
    setLoading(true);
    var ctx = weekContext(monday);
    try {
      var parsed = await aiParse(rawText, ctx);
      var n = addParsed(parsed);
      setInfo("Added "+n+" "+(n===1?"entry":"entries")+". Check each row, then set hours away and Save week.");
      setRawText("");
    } catch(e){
      var local = localParse(rawText, ctx.year, ctx.month);
      if(local.length){
        var m = addParsed(local);
        setInfo("Added "+m+" entries (built-in parser — /api/claude was unreachable; check the proxy + ANTHROPIC_API_KEY).");
        setRawText("");
      } else {
        setError("Couldn't read that. Add rows by hand below, or paste in the 'names day date venue' style.");
      }
    }
    setLoading(false);
  };

  function update(id, patch){ setRows(function(prev){ return prev.map(function(r){ return r.id===id ? Object.assign({}, r, patch) : r; }); }); }
  function addRow(){ setRows(function(prev){ return prev.concat([{ id: RID++, date: monday, employee:"", venue:"", evening:false, overnight:false, tier:"10", manualRate:false, rateOverride:"" }]); }); }
  function removeRow(id){ setRows(function(prev){ return prev.filter(function(r){ return r.id!==id; }); }); }

  function clearSheet(){
    if(!window.confirm("Clear the whole sheet? Any week you've already saved stays in Reports until you Save again.")) return;
    setRows([]); setNotes("");
    try { localStorage.removeItem(draftKey()); } catch(e){}
  }

  function saveRates(){
    if(setSettings) setSettings(Object.assign({}, settings, { racingRates: rateDraft }));
    setInfo("Rates saved."); setSettingsOpen(false);
  }

  var saveWeek = async function(){
    if(!user || !supabase){ setError("Not signed in."); return; }
    setSaving(true); setError(""); setInfo("");
    try {
      await supabase.from("racing_expenses").delete().eq("user_id", user.id).eq("week_start", monday);
      if(computed.length){
        var payload = computed.map(function(r){
          return { user_id: user.id, week_start: monday, work_date: r.date, employee: r.employee,
            venue: r.venue, evening: r.evening, overnight: r.overnight, hours_tier: r.tier,
            rate: r.rate, rate_label: r.autoLabel, manual_rate: r.manualRate,
            tax_free: r.tf, taxable: r.taxable, notes: notes };
        });
        var res = await supabase.from("racing_expenses").insert(payload);
        if(res.error) throw new Error(res.error.message);
      }
      setInfo("Week saved. It'll show in Reports.");
    } catch(e){ setError("Save failed: "+e.message); }
    setSaving(false);
  };

  function copyCSV(){
    var head=["Date","Employee","Racemeeting","Rate type","Rate","Hours","Tax Free","Tax"];
    var lines=computed.map(function(r){ return [fmtDate(r.date), r.employee, r.venue, r.autoLabel, r.rate.toFixed(2), hoursLabel(r.tier), r.tf.toFixed(2), r.taxable.toFixed(2)]; });
    lines.push(["","","","OVERALL TOTAL", totals.rate.toFixed(2), "", totals.tf.toFixed(2), totals.taxable.toFixed(2)]);
    var csv=[head].concat(lines).map(function(row){ return row.map(function(c){ return '"'+String(c).replace(/"/g,'""')+'"'; }).join(","); }).join("\n");
    if(navigator.clipboard) navigator.clipboard.writeText(csv).then(function(){ setInfo("Copied as CSV."); }, function(){ setError("Clipboard blocked."); });
  }

  var th = { fontSize:11, letterSpacing:0.4, textTransform:"uppercase", color:C.textMid, textAlign:"left", padding:"8px", borderBottom:"2px solid "+C.text, whiteSpace:"nowrap" };
  var td = { padding:"5px 8px", borderBottom:"1px solid "+C.border, verticalAlign:"middle" };
  var cell = { width:"100%", border:"1px solid transparent", background:"transparent", borderRadius:6, padding:"5px 6px", fontSize:13.5, color:C.text };

  function rateInput(key, label){
    return (
      <label style={{ fontSize:12.5, color:C.textMid }}>{label}
        <input type="number" step="0.01" value={rateDraft[key]}
          onChange={function(e){ var v=Number(e.target.value); setRateDraft(function(p){ var n=Object.assign({},p); n[key]=v; return n; }); }}
          style={{ width:"100%", marginTop:4, padding:"8px 10px", background:C.cardOff, border:"1px solid "+C.border, borderRadius:8, fontSize:14, color:C.text }} />
      </label>
    );
  }

  return (
    <div>
      <style>{"@media screen { #print-area.re-report { position: absolute !important; left: -9999px !important; top: 0 !important; width: 760px; } } #print-area.re-report table { border-collapse: collapse; width: 100%; } #print-area.re-report th, #print-area.re-report td { border: 1px solid #444; padding: 5px 7px; font-size: 12px; text-align: left; } #print-area.re-report td.num, #print-area.re-report th.num { text-align: right; }"}</style>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12, flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800, color:C.text }}>Racing Expenses</div>
          <div style={{ fontSize:13, color:C.textMid, marginTop:2 }}>Paste the week's messages — it builds and totals the sheet.</div>
        </div>
        <Btn variant="ghost" onClick={function(){ setRateDraft(rates); setSettingsOpen(function(o){return !o;}); }} style={{ fontSize:12, padding:"7px 13px" }}>Rates</Btn>
      </div>

      {settingsOpen && (
        <div style={{ background:C.card, border:"1px solid "+C.border, borderRadius:12, padding:16, marginBottom:14 }}>
          <div style={{ fontWeight:700, color:C.text, marginBottom:2 }}>Yard rates</div>
          <div style={{ fontSize:12.5, color:C.textMid, marginBottom:12 }}>Saved with your yard settings.</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10 }}>
            {rateInput("dayMeeting","Day meeting (incl. Sat)")}
            {rateInput("eveningMeeting","Evening meeting")}
            {rateInput("sunBankHolSatEve","Sun / Bank hol / Sat eve")}
            {rateInput("overnight","Overnight")}
            {rateInput("dundalkEvening","Dundalk evening")}
          </div>
          <div style={{ fontWeight:700, color:C.text, margin:"16px 0 2px" }}>Tax-free allowance (Revenue)</div>
          <div style={{ fontSize:12.5, color:C.textMid, marginBottom:12 }}>Statutory — verify against Revenue's current day-subsistence rates.</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10 }}>
            {rateInput("taxFree10","10+ hours away")}
            {rateInput("taxFree5","5–10 hours away")}
          </div>
          <div style={{ marginTop:14 }}><Btn onClick={saveRates}>Save rates</Btn></div>
        </div>
      )}

      <div style={{ background:C.card, border:"1px solid "+C.border, borderRadius:12, padding:16, marginBottom:14 }}>
        <div style={{ display:"flex", gap:16, alignItems:"flex-end", flexWrap:"wrap", marginBottom:10 }}>
          <label style={{ fontSize:12.5, color:C.textMid }}>Payroll week (Monday)
            <input type="date" value={monday} onChange={function(e){ setMonday(e.target.value); }}
              style={{ display:"block", marginTop:4, width:170, padding:"8px 10px", background:C.cardOff, border:"1px solid "+C.border, borderRadius:8, fontSize:14, color:C.text }} />
          </label>
        </div>
        <textarea value={rawText} onChange={function(e){ setRawText(e.target.value); }} rows={5}
          placeholder={"Paste the week's messages…\ne.g. Alan, Brian and Tom Fri 5th Clonmel"}
          style={{ width:"100%", padding:"10px 12px", background:C.cardOff, border:"1px solid "+C.border, borderRadius:10, fontSize:14, color:C.text, resize:"vertical", lineHeight:1.5, boxSizing:"border-box" }} />
        {error && <div style={{ color:C.red, fontSize:13, marginTop:10 }}>{error}</div>}
        {info && <div style={{ color:C.green, fontSize:13, marginTop:10 }}>{info}</div>}
        <div style={{ marginTop:12, display:"flex", gap:10, flexWrap:"wrap" }}>
          <Btn onClick={handleParse} disabled={loading}>{loading ? "Reading…" : "Build sheet from messages"}</Btn>
          <Btn variant="ghost" onClick={addRow}>Add row</Btn>
        </div>
      </div>

      <div style={{ background:C.card, border:"1px solid "+C.border, borderRadius:12, padding:16, overflowX:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10, flexWrap:"wrap", gap:8 }}>
          <div style={{ fontWeight:800, fontSize:17, color:C.text }}>Summary of Weekly Racing Expenses</div>
          <div style={{ fontSize:12.5, color:C.textMid }}>Week of {fmtDate(monday)}</div>
        </div>

        {computed.length===0 ? (
          <div style={{ textAlign:"center", padding:"36px 16px", color:C.textMid }}>No entries yet — paste the week's messages above.</div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:740 }}>
            <thead><tr>
              <th style={th}>Date</th><th style={th}>Employee</th><th style={th}>Racemeeting</th>
              <th style={th}>Rate</th><th style={th}>Hours away</th>
              <th style={Object.assign({},th,{textAlign:"right"})}>Tax free</th>
              <th style={Object.assign({},th,{textAlign:"right"})}>Tax</th><th style={th}></th>
            </tr></thead>
            <tbody>
              {computed.map(function(r){
                return (
                  <tr key={r.id}>
                    <td style={td}><input type="date" value={r.date} onChange={function(e){ update(r.id,{date:e.target.value}); }} style={Object.assign({},cell,{width:140})} /></td>
                    <td style={td}><input value={r.employee} placeholder="Name" onChange={function(e){ update(r.id,{employee:e.target.value}); }} style={cell} /></td>
                    <td style={td}>
                      <input value={r.venue} placeholder="Course" onChange={function(e){ update(r.id,{venue:e.target.value}); }} style={cell} />
                      <div style={{ display:"flex", gap:10, padding:"2px 6px" }}>
                        <label style={{ fontSize:11, color:C.textMid, display:"flex", gap:4, alignItems:"center" }}><input type="checkbox" checked={r.evening} onChange={function(e){ update(r.id,{evening:e.target.checked}); }} /> Evening</label>
                        <label style={{ fontSize:11, color:C.textMid, display:"flex", gap:4, alignItems:"center" }}><input type="checkbox" checked={r.overnight} onChange={function(e){ update(r.id,{overnight:e.target.checked}); }} /> Overnight</label>
                      </div>
                    </td>
                    <td style={td}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontWeight:700, color:C.text }}>{euro(r.rate)}</span>
                        {!r.manualRate
                          ? <span style={{ fontSize:10.5, fontWeight:700, padding:"2px 7px", borderRadius:999, background:C.cardOff, color:C.textMid, whiteSpace:"nowrap" }}>{r.autoLabel}</span>
                          : <button onClick={function(){ update(r.id,{manualRate:false,rateOverride:""}); }} title="Back to auto" style={{ border:"none", background:"none", cursor:"pointer", color:C.gold, fontSize:11, fontWeight:700 }}>auto</button>}
                      </div>
                      <input type="number" placeholder="override" value={r.manualRate?r.rateOverride:""} onChange={function(e){ update(r.id,{manualRate:true,rateOverride:e.target.value}); }} style={Object.assign({},cell,{fontSize:11,marginTop:2,color:C.textMid})} />
                    </td>
                    <td style={td}>
                      <div style={{ display:"inline-flex", border:"1px solid "+C.border, borderRadius:7, overflow:"hidden" }}>
                        {[["10","10+"],["5","5–10"],["0","<5"]].map(function(opt){
                          var on = r.tier===opt[0];
                          return <button key={opt[0]} onClick={function(){ update(r.id,{tier:opt[0]}); }}
                            style={{ fontSize:11.5, fontWeight:700, padding:"4px 9px", border:"none", cursor:"pointer", background: on?C.navy:C.card, color: on?"#fff":C.textMid }}>{opt[1]}</button>;
                        })}
                      </div>
                    </td>
                    <td style={Object.assign({},td,{textAlign:"right"})}>{euro(r.tf)}</td>
                    <td style={Object.assign({},td,{textAlign:"right",fontWeight:700,color:C.text})}>{euro(r.taxable)}</td>
                    <td style={td}><button onClick={function(){ removeRow(r.id); }} title="Remove" style={{ border:"none", background:"none", cursor:"pointer", color:C.red, fontSize:14 }}>✕</button></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot><tr>
              <td colSpan={3} style={Object.assign({},td,{fontWeight:800,color:C.text,borderTop:"2px solid "+C.text,borderBottom:"none",paddingTop:10})}>OVERALL TOTAL</td>
              <td style={Object.assign({},td,{fontWeight:800,color:C.text,borderTop:"2px solid "+C.text,borderBottom:"none"})}>{euro(totals.rate)}</td>
              <td style={Object.assign({},td,{borderTop:"2px solid "+C.text,borderBottom:"none"})}></td>
              <td style={Object.assign({},td,{textAlign:"right",fontWeight:800,color:C.text,borderTop:"2px solid "+C.text,borderBottom:"none"})}>{euro(totals.tf)}</td>
              <td style={Object.assign({},td,{textAlign:"right",fontWeight:800,color:C.text,borderTop:"2px solid "+C.text,borderBottom:"none"})}>{euro(totals.taxable)}</td>
              <td style={Object.assign({},td,{borderTop:"2px solid "+C.text,borderBottom:"none"})}></td>
            </tr></tfoot>
          </table>
        )}

        {computed.length>0 && (
          <div style={{ marginTop:14 }}>
            <div style={{ fontSize:12, color:C.textMid, marginBottom:4 }}>Racing notes</div>
            <textarea value={notes} onChange={function(e){ setNotes(e.target.value); }} rows={2} placeholder="List dates & racecourses, anything for the accountant…"
              style={{ width:"100%", padding:"9px 11px", background:C.cardOff, border:"1px solid "+C.border, borderRadius:8, fontSize:13, color:C.text, resize:"vertical", boxSizing:"border-box" }} />
          </div>
        )}
      </div>

      {computed.length>0 && (
        <div style={{ display:"flex", gap:10, marginTop:14, flexWrap:"wrap" }}>
          <Btn onClick={saveWeek} disabled={saving}>{saving ? "Saving…" : "Save week"}</Btn>
          <Btn variant="ghost" onClick={function(){ window.print(); }}>Print</Btn>
          <Btn variant="ghost" onClick={copyCSV}>Copy as CSV</Btn>
          <Btn variant="ghost" onClick={clearSheet}>Clear sheet</Btn>
        </div>
      )}

      {/* Clean print-only report (revealed by the app's global @media print rule) */}
      <div id="print-area" className="re-report">
        <div style={{ fontSize:18, fontWeight:800, marginBottom:2 }}>Summary of Weekly Racing Expenses</div>
        <div style={{ fontSize:12, marginBottom:10 }}>Payroll week (Mon): {monday}</div>
        <div style={{ fontSize:11, marginBottom:12, lineHeight:1.5 }}>
          Rates — Day/Sat {euro(rates.dayMeeting)} · Evening {euro(rates.eveningMeeting)} · Sun/Bank hol/Sat eve {euro(rates.sunBankHolSatEve)} · Overnight {euro(rates.overnight)} · Dundalk eve {euro(rates.dundalkEvening)}<br/>
          Tax-free allowance — 10+ hrs {euro(rates.taxFree10)} · 5–10 hrs {euro(rates.taxFree5)}
        </div>
        <table>
          <thead><tr>
            <th>Date</th><th>Employee</th><th>Racemeeting</th><th className="num">Rate</th><th>Hours</th><th className="num">Tax Free</th><th className="num">Tax</th>
          </tr></thead>
          <tbody>
            {computed.map(function(r){
              return (
                <tr key={"p"+r.id}>
                  <td>{fmtDate(r.date)}</td>
                  <td>{r.employee}</td>
                  <td>{r.venue}</td>
                  <td className="num">{euro(r.rate)}</td>
                  <td>{hoursLabel(r.tier)}</td>
                  <td className="num">{euro(r.tf)}</td>
                  <td className="num">{euro(r.taxable)}</td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={3} style={{ fontWeight:800 }}>OVERALL TOTAL</td>
              <td className="num" style={{ fontWeight:800 }}>{euro(totals.rate)}</td>
              <td></td>
              <td className="num" style={{ fontWeight:800 }}>{euro(totals.tf)}</td>
              <td className="num" style={{ fontWeight:800 }}>{euro(totals.taxable)}</td>
            </tr>
          </tbody>
        </table>
        {notes ? <div style={{ marginTop:12, fontSize:12 }}><b>Racing notes:</b> {notes}</div> : null}
      </div>
    </div>
  );
}

export default RacingExpenses;
