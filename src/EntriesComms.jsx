import React, { useState, useEffect } from "react";
import { Btn, C } from "./shared";

// Entries & Declarations Comms
// Upload the engagements file. App detects stage CHANGES vs last known state
// per horse+race, and lets you one-tap message owners about new entries/decs.
// Duplicate protection: only fires when stage advances (none->entered->declared).

function EntriesComms({ horses, user, supabase, settings }) {
  var stateRecordsState = useState({});   // { "horseId|raceKey": { stage, notifiedEntered, notifiedDeclared } }
  var stateRecords = stateRecordsState[0]; var setStateRecords = stateRecordsState[1];
  var pendingState = useState([]);          // changes detected, awaiting send
  var pending = pendingState[0]; var setPending = pendingState[1];
  var historyState = useState([]);
  var history = historyState[0]; var setHistory = historyState[1];
  var loadingState = useState(true);
  var loading = loadingState[0]; var setLoading = loadingState[1];
  var viewState = useState("upload");
  var view = viewState[0]; var setView = viewState[1];
  var toastState = useState(null);
  var toast = toastState[0]; var setToast = toastState[1];

  function showToast(msg, color) { setToast({ msg: msg, color: color || C.green }); setTimeout(function() { setToast(null); }, 3000); }

  useEffect(function() {
    if (!user || !supabase) { setLoading(false); return; }
    supabase.from("entry_states").select("*").eq("user_id", user.id)
      .then(function(res) {
        if (res.data) {
          var map = {};
          res.data.forEach(function(r) { map[r.combo_key] = r; });
          setStateRecords(map);
        }
        setLoading(false);
      });
    supabase.from("entry_comms_log").select("*").eq("user_id", user.id)
      .order("sent_at", { ascending: false }).limit(100)
      .then(function(res) { if (res.data) setHistory(res.data); });
  }, [user]);

  function matchHorse(name) {
    var nl = (name || "").toLowerCase().trim();
    if (!nl) return null;
    for (var i = 0; i < (horses || []).length; i++) {
      var hl = horses[i].name.toLowerCase().trim();
      if (hl === nl || hl.indexOf(nl) >= 0 || nl.indexOf(hl) >= 0) return horses[i];
    }
    return null;
  }

  function normaliseStage(raw) {
    var s = (raw || "").toLowerCase();
    if (s.indexOf("declar") >= 0 || s.indexOf("dec") >= 0 || s.indexOf("runner") >= 0) return "declared";
    if (s.indexOf("enter") >= 0 || s.indexOf("entry") >= 0 || s.indexOf("engaged") >= 0) return "entered";
    return "";
  }

  function handleCSV(ev) {
    var file = ev.target.files[0];
    if (!file) return;
    ev.target.value = "";
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var text = e.target.result;
        var rawLines = text.split("\n").filter(function(l) { return l.trim(); });
        if (rawLines.length < 2) { showToast("File looks empty", C.red); return; }
        var sep = rawLines[0].indexOf("\t") >= 0 ? "\t" : ",";
        var headers = rawLines[0].split(sep).map(function(h) {
          return h.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
        });
        var detected = [];
        for (var i = 1; i < rawLines.length; i++) {
          var cols = rawLines[i].split(sep).map(function(c) {
            var t = c.trim();
            if (t.length > 1 && t[0] === '"' && t[t.length-1] === '"') return t.slice(1, -1);
            return t;
          });
          if (!cols[0]) continue;
          var row = {};
          for (var j = 0; j < headers.length; j++) { row[headers[j]] = cols[j] || ""; }

          var horseName = (row.horse || row.horse_name || row.name || "").trim();
          if (!horseName) continue;
          var stage = normaliseStage(row.stage || row.status || row.type || "");
          if (!stage) continue;

          var venue = (row.meeting || row.venue || row.course || row.track || "").trim();
          var raceDate = (row.date || row.race_date || row.day || "").trim();
          var raceName = (row.race || row.race_name || row.time || "").trim();
          var raceKey = (raceDate + "|" + venue + "|" + raceName).toLowerCase();

          var horse = matchHorse(horseName);
          var horseId = horse ? horse.id : ("unmatched_" + horseName.toLowerCase());
          var comboKey = horseId + "||" + raceKey;

          var prev = stateRecords[comboKey];
          var prevStage = prev ? prev.stage : "";
          var notifiedEntered = prev ? prev.notified_entered : false;
          var notifiedDeclared = prev ? prev.notified_declared : false;

          // Detect a NEW notifiable change
          var changeType = null;
          if (stage === "entered" && !notifiedEntered) changeType = "entered";
          else if (stage === "declared" && !notifiedDeclared) changeType = "declared";

          if (changeType) {
            detected.push({
              comboKey: comboKey,
              horseId: horseId,
              horseName: horse ? horse.name : horseName,
              matched: !!horse,
              ownerName: horse ? (horse.owner || "") : "",
              ownerPhone: horse ? (horse.ownerPhone || "") : "",
              venue: venue, raceDate: raceDate, raceName: raceName,
              stage: stage, changeType: changeType,
              prevStage: prevStage,
              send: !!(horse && horse.ownerPhone)
            });
          }
        }
        if (detected.length === 0) {
          showToast("No new entries or declarations since last upload", C.blue);
        } else {
          setPending(detected);
          setView("review");
        }
      } catch (err) {
        showToast("Could not read file. Check the format.", C.red);
      }
    };
    reader.readAsText(file);
  }

  function buildMessage(item) {
    var trainer = (settings && settings.trainerName) || (settings && settings.yardName) || "the yard";
    var verb = item.changeType === "declared" ? "declared" : "entered";
    var parts = [];
    parts.push("Update from " + trainer);
    parts.push(item.horseName + " has been " + verb + (item.venue ? " at " + item.venue : ""));
    if (item.raceDate) parts.push("Race date: " + item.raceDate);
    if (item.raceName) parts.push(item.raceName);
    if (item.changeType === "declared") parts.push("Best of luck!");
    return parts.join("\n");
  }

  function toggleSend(idx) {
    setPending(function(p) { return p.map(function(it, i) { return i === idx ? Object.assign({}, it, { send: !it.send }) : it; }); });
  }

  async function sendAll() {
    var toSend = pending.filter(function(p) { return p.send && p.ownerPhone; });
    if (toSend.length === 0) { showToast("Nothing selected to send", C.amber); return; }

    var newStates = Object.assign({}, stateRecords);
    var logRows = [];
    var stateRows = [];

    for (var i = 0; i < toSend.length; i++) {
      var item = toSend[i];
      var phone = item.ownerPhone.split("").filter(function(d) { return (d >= "0" && d <= "9") || d === "+"; }).join("");
      var msg = buildMessage(item);
      // Open WhatsApp for each (staggered so browser allows them)
      (function(p, m, delay) {
        setTimeout(function() { window.open("https://wa.me/" + p + "?text=" + encodeURIComponent(m), "_blank"); }, delay);
      })(phone, msg, i * 600);

      // Update stored state so this never re-sends
      var existing = newStates[item.comboKey] || { combo_key: item.comboKey, user_id: user.id, notified_entered: false, notified_declared: false };
      existing.stage = item.stage;
      existing.horse_name = item.horseName;
      existing.race_info = (item.raceDate + " " + item.venue + " " + item.raceName).trim();
      if (item.changeType === "entered") existing.notified_entered = true;
      if (item.changeType === "declared") { existing.notified_declared = true; existing.notified_entered = true; }
      existing.updated_at = new Date().toISOString();
      newStates[item.comboKey] = existing;
      stateRows.push(existing);

      logRows.push({
        user_id: user.id, horse_name: item.horseName, owner_name: item.ownerName,
        change_type: item.changeType, race_info: existing.race_info, sent_at: new Date().toISOString()
      });
    }

    setStateRecords(newStates);
    // Persist state + log
    if (supabase) {
      supabase.from("entry_states").upsert(stateRows, { onConflict: "combo_key" }).then(function() {});
      supabase.from("entry_comms_log").insert(logRows).then(function(res) {
        if (!res.error) setHistory(function(h) { return logRows.concat(h); });
      });
    }
    showToast(toSend.length + " owner message(s) opened in WhatsApp", C.green);
    setPending([]);
    setView("upload");
  }

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: C.textMid }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: toast.color, color: "#fff", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>{toast.msg}</div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Entries & Declarations</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 2 }}>Upload your engagements file - owners are messaged only about new changes</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant={view !== "history" ? "primary" : "ghost"} onClick={function() { setView("upload"); }}>Upload</Btn>
          <Btn variant={view === "history" ? "primary" : "ghost"} onClick={function() { setView("history"); }}>History</Btn>
        </div>
      </div>

      {view === "upload" && (
        <div>
          <label style={{ display: "block", border: "2px dashed " + C.border, borderRadius: 14, padding: "40px 20px", textAlign: "center", cursor: "pointer", background: C.cardOff }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Upload Pending Engagements file</div>
            <div style={{ fontSize: 13, color: C.textMid, marginBottom: 4 }}>CSV or tab-separated. Needs Horse and Stage/Status columns.</div>
            <div style={{ fontSize: 12, color: C.textMid }}>The app compares against the last upload and only flags horses whose stage has changed.</div>
            <input type="file" accept=".csv,.txt,.tsv" onChange={handleCSV} style={{ display: "none" }} />
          </label>
          <div style={{ background: C.blueBg, border: "1px solid " + C.blue + "30", borderRadius: 10, padding: "14px 16px", marginTop: 16, fontSize: 13, color: C.text, lineHeight: 1.6 }}>
            <strong>How it works:</strong> You can upload daily or weekly - it makes no difference. The app remembers which horses you have already messaged owners about for each race, so the same owner never gets a duplicate message about the same entry. Only genuine new entries and declarations are flagged.
          </div>
        </div>
      )}

      {view === "review" && (
        <div>
          <div style={{ background: C.goldBg, border: "1px solid " + C.gold + "40", borderRadius: 10, padding: "12px 16px", marginBottom: 14, fontSize: 14, color: C.text, fontWeight: 600 }}>
            {pending.length + " new change(s) detected. Review and send."}
          </div>
          {pending.map(function(item, idx) {
            return (
              <div key={idx} style={{ background: C.card, border: "1px solid " + (item.matched ? C.border : C.amber + "60"), borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <input type="checkbox" checked={item.send} disabled={!item.ownerPhone} onChange={function() { toggleSend(idx); }} style={{ marginTop: 4, width: 18, height: 18, flexShrink: 0, accentColor: C.gold }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{item.horseName}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: item.changeType === "declared" ? C.green : C.blue, padding: "2px 9px", borderRadius: 10, textTransform: "uppercase" }}>{item.changeType}</span>
                      {!item.matched && <span style={{ fontSize: 11, color: C.amber, fontWeight: 600 }}>not in yard list</span>}
                    </div>
                    <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>{[item.raceDate, item.venue, item.raceName].filter(Boolean).join("  -  ")}</div>
                    <div style={{ fontSize: 12, color: item.ownerPhone ? C.textMid : C.red, marginTop: 3 }}>
                      {item.ownerName ? ("Owner: " + item.ownerName) : "No owner on file"}
                      {item.ownerPhone ? "" : " - no phone, cannot message"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn onClick={sendAll}>{"Send " + pending.filter(function(p) { return p.send && p.ownerPhone; }).length + " message(s)"}</Btn>
            <Btn variant="ghost" onClick={function() { setPending([]); setView("upload"); }}>Cancel</Btn>
          </div>
          <div style={{ fontSize: 12, color: C.textMid, marginTop: 10 }}>Messages open in WhatsApp one after another. Sending marks each as done so owners are never messaged twice about the same change.</div>
        </div>
      )}

      {view === "history" && (
        <div>
          {history.length === 0 ? (
            <div style={{ background: C.card, border: "1.5px dashed " + C.border, borderRadius: 12, padding: "40px 20px", textAlign: "center", color: C.textMid }}>No messages sent yet.</div>
          ) : (
            history.map(function(h, i) {
              return (
                <div key={i} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 10, padding: "12px 14px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{h.horse_name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: h.change_type === "declared" ? C.green : C.blue, padding: "2px 8px", borderRadius: 10, marginLeft: 8, textTransform: "uppercase" }}>{h.change_type}</span>
                    <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{h.owner_name + (h.race_info ? "  -  " + h.race_info : "")}</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.textMid }}>{new Date(h.sent_at).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}</div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default EntriesComms;
