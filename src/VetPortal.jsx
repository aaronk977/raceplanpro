import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Btn, C } from "./shared";

// Vet Portal - loaded when URL contains ?vet=TOKEN
// Public page where a yard's vet uploads a prescription and drafts a med register entry.
// The trainer must confirm before anything reaches the official register.

var SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
var SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

function VetPortal({ token }) {
  var yardState = useState(null);
  var yard = yardState[0]; var setYard = yardState[1];
  var horsesState = useState([]);
  var horseList = horsesState[0]; var setHorseList = horsesState[1];
  var loadingState = useState(true);
  var loading = loadingState[0]; var setLoading = loadingState[1];
  var errorState = useState(null);
  var error = errorState[0]; var setError = errorState[1];
  var uploadingState = useState(false);
  var uploading = uploadingState[0]; var setUploading = uploadingState[1];
  var doneState = useState(false);
  var done = doneState[0]; var setDone = doneState[1];
  var statusState = useState(null);
  var status = statusState[0]; var setStatus = statusState[1];

  var fileState = useState(null);
  var file = fileState[0]; var setFile = fileState[1];

  // Prescription / med register draft fields
  var horseIdState = useState("");
  var horseId = horseIdState[0]; var setHorseId = horseIdState[1];
  var vetNameState = useState("");
  var vetName = vetNameState[0]; var setVetName = vetNameState[1];
  var dateState = useState(new Date().toISOString().slice(0, 10));
  var date = dateState[0]; var setDate = dateState[1];
  var brandState = useState("");
  var drugBrand = brandState[0]; var setDrugBrand = brandState[1];
  var activeState = useState("");
  var drugActive = activeState[0]; var setDrugActive = activeState[1];
  var routeState = useState("");
  var route = routeState[0]; var setRoute = routeState[1];
  var qtyState = useState("");
  var quantity = qtyState[0]; var setQuantity = qtyState[1];
  var reasonState = useState("");
  var reason = reasonState[0]; var setReason = reasonState[1];
  var withdrawalState = useState("");
  var withdrawal = withdrawalState[0]; var setWithdrawal = withdrawalState[1];
  var notesState = useState("");
  var notes = notesState[0]; var setNotes = notesState[1];

  var sb = createClient(SUPABASE_URL, SUPABASE_ANON);

  var ROUTES = ["", "Oral (O)", "Topical (T)", "Intravenous (I/V)", "Intramuscular (I/M)", "Subcutaneous (S/C)", "Intraarticular (I/A)", "Inhalation", "Other"];

  useEffect(function() {
    if (!token) { setError("Invalid link."); setLoading(false); return; }
    sb.from("vet_links").select("id, yard_name, user_id").eq("token", token).eq("active", true)
      .single()
      .then(function(res) {
        if (res.error || !res.data) { setError("This link is invalid or has been deactivated."); setLoading(false); return; }
        setYard(res.data);
        // Load that yard's horses so the vet can pick which horse(s)
        sb.from("horses").select("id, name").eq("user_id", res.data.user_id).order("name")
          .then(function(hr) {
            if (hr.data) setHorseList(hr.data);
            setLoading(false);
          });
      });
  }, [token]);

  function handleFile(e) {
    var f = e.target.files[0];
    if (f) setFile(f);
    e.target.value = "";
  }

  function submit() {
    if (!horseId) { setStatus("Please select the horse this prescription is for."); return; }
    if (!drugBrand && !file) { setStatus("Please add the medication name or attach the prescription."); return; }
    setUploading(true); setStatus("Submitting...");

    var proceed = function(filePath) {
      var horse = horseList.find(function(h) { return h.id === horseId; });
      var rec = {
        user_id: yard.user_id,
        vet_link_id: yard.id,
        horse_id: horseId,
        horse_name: horse ? horse.name : "",
        vet_name: vetName,
        date: date,
        drug_brand: drugBrand,
        drug_active: drugActive,
        route: route,
        quantity: quantity,
        reason: reason,
        withdrawal_time: withdrawal,
        notes: notes,
        file_path: filePath || "",
        status: "pending",
        submitted_at: new Date().toISOString()
      };
      sb.from("vet_prescriptions").insert(rec).then(function(res) {
        setUploading(false);
        if (res.error) { setStatus("Something went wrong saving the prescription. Please try again."); return; }
        setDone(true);
      });
    };

    if (file) {
      var safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      var path = yard.user_id + "/vet/" + horseId + "_" + Date.now() + "_" + safe;
      sb.storage.from("vet-prescriptions").upload(path, file, { upsert: false }).then(function(res) {
        if (res.error) { setStatus("File upload failed - saving the details without the attachment."); proceed(""); }
        else proceed(path);
      });
    } else {
      proceed("");
    }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, color: C.textMid }}>Loading...</div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, padding: 24 }}>
      <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "32px 28px", maxWidth: 420, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.red, marginBottom: 8 }}>Link not available</div>
        <div style={{ fontSize: 14, color: C.textMid }}>{error}</div>
      </div>
    </div>
  );

  if (done) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, padding: 24 }}>
      <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "36px 28px", maxWidth: 440, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>{"\u2713"}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.navy, marginBottom: 8 }}>Prescription submitted</div>
        <div style={{ fontSize: 14, color: C.textMid, lineHeight: 1.6, marginBottom: 20 }}>
          Thank you. The prescription has been sent to {yard.yard_name} for the trainer to review and confirm onto their medicines register.
        </div>
        <Btn onClick={function() {
          setDone(false); setHorseId(""); setDrugBrand(""); setDrugActive(""); setRoute(""); setQuantity(""); setReason(""); setWithdrawal(""); setNotes(""); setFile(null); setStatus(null);
        }}>Submit another</Btn>
      </div>
    </div>
  );

  var field = function(label, value, setter, placeholder, type) {
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
        <input type={type || "text"} value={value} onChange={function(e) { setter(e.target.value); }} placeholder={placeholder || ""}
          style={{ width: "100%", padding: "10px 12px", border: "1px solid " + C.border, borderRadius: 8, fontSize: 14, color: C.text, background: C.cardOff }} />
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "24px 16px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ background: C.navy, borderRadius: "14px 14px 0 0", padding: "20px 24px" }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>Veterinary Prescription</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 3 }}>{yard.yard_name}</div>
        </div>
        <div style={{ background: C.card, border: "1px solid " + C.border, borderTop: "none", borderRadius: "0 0 14px 14px", padding: "22px 24px" }}>
          <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, marginBottom: 18, padding: "10px 14px", background: C.cardOff, borderRadius: 8 }}>
            Submit a prescription directly to the yard. Attach your prescription document and/or enter the details below. The trainer will review and confirm it onto their medicines register.
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Horse *</div>
            <select value={horseId} onChange={function(e) { setHorseId(e.target.value); }}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid " + C.border, borderRadius: 8, fontSize: 14, color: C.text, background: C.cardOff }}>
              <option value="">Select horse</option>
              {horseList.map(function(h) { return <option key={h.id} value={h.id}>{h.name}</option>; })}
            </select>
          </div>

          {field("Veterinary Surgeon", vetName, setVetName, "Your name")}
          {field("Date", date, setDate, "", "date")}
          {field("Medication - brand name", drugBrand, setDrugBrand, "e.g. Metacam")}
          {field("Active drug", drugActive, setDrugActive, "e.g. Meloxicam")}

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Route of administration</div>
            <select value={route} onChange={function(e) { setRoute(e.target.value); }}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid " + C.border, borderRadius: 8, fontSize: 14, color: C.text, background: C.cardOff }}>
              {ROUTES.map(function(r) { return <option key={r} value={r}>{r || "Select route"}</option>; })}
            </select>
          </div>

          {field("Quantity", quantity, setQuantity, "e.g. 15ml")}
          {field("Reason for administration", reason, setReason, "e.g. lameness")}
          {field("Recommended withdrawal time", withdrawal, setWithdrawal, "e.g. 168 hours / 7 days")}
          {field("Notes (optional)", notes, setNotes, "Anything else the yard should know")}

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Attach prescription (photo or PDF)</div>
            <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleFile}
              style={{ width: "100%", fontSize: 13, color: C.text }} />
            {file && <div style={{ fontSize: 12, color: C.green, marginTop: 6, fontWeight: 600 }}>{"\u2713 " + file.name}</div>}
          </div>

          {status && <div style={{ fontSize: 13, color: status.indexOf("wrong") >= 0 || status.indexOf("failed") >= 0 || status.indexOf("Please") >= 0 ? C.red : C.textMid, marginBottom: 12, fontWeight: 600 }}>{status}</div>}

          <Btn onClick={submit} disabled={uploading} style={{ width: "100%" }}>{uploading ? "Submitting..." : "Submit Prescription"}</Btn>

          <div style={{ fontSize: 11, color: C.textMid, marginTop: 14, lineHeight: 1.5, textAlign: "center" }}>
            This does not replace your own prescribing records. It sends a copy to the yard to save them re-typing it.
          </div>
        </div>
      </div>
    </div>
  );
}

export default VetPortal;
