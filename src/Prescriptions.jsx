import React, { useState, useEffect } from "react";
import { Btn, C } from "./shared";

// Vet Prescriptions - photo store by date. App stores and displays only.
function Prescriptions({ horses, user, supabase, settings }) {
  var entriesState = useState([]);
  var entries = entriesState[0]; var setEntries = entriesState[1];
  var uploadingState = useState(false);
  var uploading = uploadingState[0]; var setUploading = uploadingState[1];
  var uploadDateState = useState(new Date().toISOString().slice(0, 10));
  var uploadDate = uploadDateState[0]; var setUploadDate = uploadDateState[1];
  var noteState = useState("");
  var note = noteState[0]; var setNote = noteState[1];
  var filterDateState = useState("");
  var filterDate = filterDateState[0]; var setFilterDate = filterDateState[1];
  var viewImgState = useState(null);
  var viewImg = viewImgState[0]; var setViewImg = viewImgState[1];
  var statusState = useState(null);
  var status = statusState[0]; var setStatus = statusState[1];

  // PIN gate (shares the same registerPin as the Medicines Register)
  var registerPin = (settings && settings.registerPin) || "";
  var pinOkState = useState(false);
  var pinOk = pinOkState[0]; var setPinOk = pinOkState[1];
  var pinInputState = useState("");
  var pinInput = pinInputState[0]; var setPinInput = pinInputState[1];
  var pinErrorState = useState(false);
  var pinError = pinErrorState[0]; var setPinError = pinErrorState[1];

  useEffect(function() {
    if (!user || !supabase) return;
    supabase.from("prescriptions").select("*").eq("user_id", user.id)
      .order("date", { ascending: false })
      .then(function(res) {
        if (!res.data) return;
        var paths = res.data.map(function(e) { return e.file_path; }).filter(Boolean);
        if (paths.length === 0) { setEntries(res.data); return; }
        supabase.storage.from("prescriptions").createSignedUrls(paths, 3600).then(function(sres) {
          var urlMap = {};
          if (sres.data) sres.data.forEach(function(s) { if (s.path) urlMap[s.path] = s.signedUrl; });
          var withUrls = res.data.map(function(e) { return Object.assign({}, e, { file_url: urlMap[e.file_path] || "" }); });
          setEntries(withUrls);
        });
      });
  }, [user]);

  function checkPin() {
    if (!registerPin || pinInput === registerPin) { setPinOk(true); setPinError(false); }
    else { setPinError(true); setPinInput(""); }
  }

  function handleUpload(ev) {
    var file = ev.target.files[0];
    if (!file) return;
    ev.target.value = "";
    setUploading(true);
    setStatus("Uploading...");
    var path = user.id + "/" + uploadDate + "_" + Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    supabase.storage.from("prescriptions").upload(path, file, { cacheControl: "3600", upsert: false })
      .then(function(res) {
        if (res.error) { setStatus("Upload failed: " + res.error.message); setUploading(false); setTimeout(function() { setStatus(null); }, 4000); return; }
        var rec = {
          user_id: user.id,
          date: uploadDate,
          file_path: path,
          file_url: "",
          note: note,
          uploaded_at: new Date().toISOString()
        };
        supabase.from("prescriptions").insert(rec).select().then(function(r2) {
          if (r2.data) {
            // generate a signed url for immediate display
            supabase.storage.from("prescriptions").createSignedUrl(path, 3600).then(function(sres) {
              var withUrl = r2.data.map(function(row) { return Object.assign({}, row, { file_url: sres.data ? sres.data.signedUrl : "" }); });
              setEntries(function(p) { return withUrl.concat(p); });
            });
          }
          setUploading(false);
          setNote("");
          setStatus("Uploaded for " + uploadDate);
          setTimeout(function() { setStatus(null); }, 3000);
        });
      });
  }

  function del(e) {
    if (!window.confirm("Delete this prescription?")) return;
    setEntries(function(p) { return p.filter(function(x) { return x.id !== e.id; }); });
    if (e.file_path) supabase.storage.from("prescriptions").remove([e.file_path]).then(function() {});
    supabase.from("prescriptions").delete().eq("id", e.id).then(function() {});
  }

  var filtered = entries.filter(function(e) { return !filterDate || e.date === filterDate; });

  // Group by date
  var byDate = {};
  filtered.forEach(function(e) { if (!byDate[e.date]) byDate[e.date] = []; byDate[e.date].push(e); });
  var dates = Object.keys(byDate).sort(function(a, b) { return b.localeCompare(a); });

  // PIN GATE
  if (registerPin && !pinOk) {
    return (
      <div style={{ maxWidth: 360, margin: "60px auto", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>{"\uD83D\uDD12"}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>Vet Prescriptions</div>
        <div style={{ fontSize: 13, color: C.textMid, marginBottom: 20 }}>Enter your 4-digit PIN to access prescriptions</div>
        <input type="password" inputMode="numeric" maxLength={4} value={pinInput}
          onChange={function(e) { setPinInput(e.target.value.replace(/[^0-9]/g, "")); setPinError(false); }}
          onKeyDown={function(e) { if (e.key === "Enter") checkPin(); }}
          placeholder="****"
          style={{ width: 140, padding: "12px", fontSize: 24, textAlign: "center", letterSpacing: 8, border: "2px solid " + (pinError ? C.red : C.border), borderRadius: 10, color: C.text, marginBottom: 12 }} />
        {pinError && <div style={{ fontSize: 12, color: C.red, marginBottom: 12 }}>Incorrect PIN</div>}
        <div><Btn onClick={checkPin} disabled={pinInput.length !== 4}>Unlock</Btn></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Vet Prescriptions</div>
        <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>Photograph each prescription and file it by date. Retrieve any day's prescriptions instantly for the IHRB.</div>
      </div>

      {/* Upload card */}
      <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "16px", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase" }}>Prescription date</div>
            <input type="date" value={uploadDate} onChange={function(e) { setUploadDate(e.target.value); }}
              style={{ padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase" }}>Note (optional)</div>
            <input type="text" value={note} onChange={function(e) { setNote(e.target.value); }} placeholder="e.g. Vet visit - 3 horses"
              style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
          </div>
          <label style={{ background: C.navy, color: "#fff", padding: "10px 18px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {uploading ? "Uploading..." : "Take / Upload Photo"}
            <input type="file" accept="image/*,application/pdf" capture="environment" style={{ display: "none" }} onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
        {status && <div style={{ fontSize: 12, color: C.green, fontWeight: 600, marginTop: 10 }}>{status}</div>}
      </div>

      {/* Date filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: C.textMid }}>Filter by date:</span>
        <input type="date" value={filterDate} onChange={function(e) { setFilterDate(e.target.value); }}
          style={{ padding: "6px 10px", background: C.card, border: "1px solid " + C.border, borderRadius: 8, fontSize: 12, color: C.text }} />
        {filterDate && <button onClick={function() { setFilterDate(""); }} style={{ background: "none", border: "none", color: C.navy, fontSize: 12, cursor: "pointer" }}>Clear</button>}
      </div>

      {/* List grouped by date */}
      {dates.length === 0 ? (
        <div style={{ background: C.card, border: "1.5px dashed " + C.border, borderRadius: 12, padding: "40px 20px", textAlign: "center", color: C.textMid, fontSize: 14 }}>
          No prescriptions uploaded yet. Take a photo of today's prescription to file it.
        </div>
      ) : (
        dates.map(function(date) {
          var dayItems = byDate[date];
          return (
            <div key={date} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.navy, marginBottom: 8 }}>
                {new Date(date + "T12:00:00").toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                <span style={{ fontSize: 12, fontWeight: 400, color: C.textMid, marginLeft: 8 }}>{dayItems.length + " file" + (dayItems.length !== 1 ? "s" : "")}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                {dayItems.map(function(e) {
                  var isPdf = (e.file_path || "").toLowerCase().indexOf(".pdf") >= 0;
                  return (
                    <div key={e.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 10, overflow: "hidden" }}>
                      <div onClick={function() { if (!isPdf) setViewImg(e.file_url); else window.open(e.file_url, "_blank"); }}
                        style={{ height: 120, background: C.cardOff, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" }}>
                        {isPdf ? (
                          <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>PDF</span>
                        ) : (
                          <img src={e.file_url} alt="prescription" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                      </div>
                      <div style={{ padding: "8px 10px" }}>
                        {e.note && <div style={{ fontSize: 11, color: C.text, marginBottom: 4 }}>{e.note}</div>}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 10, color: C.textMid }}>{new Date(e.uploaded_at).toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}</span>
                          <button onClick={function() { del(e); }} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 14 }}>x</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Image viewer */}
      {viewImg && (
        <div onClick={function() { setViewImg(null); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <img src={viewImg} alt="prescription" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
}

export default Prescriptions;
