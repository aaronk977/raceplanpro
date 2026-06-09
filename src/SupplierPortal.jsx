import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Btn, C } from "./shared";

// Supplier Portal - loaded when URL contains ?supplier=TOKEN
// Completely separate view from main app

var SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
var SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

function SupplierPortal({ token }) {
  var supplierState = useState(null);
  var supplier = supplierState[0]; var setSupplier = supplierState[1];
  var loadingState = useState(true);
  var loading = loadingState[0]; var setLoading = loadingState[1];
  var errorState = useState(null);
  var error = errorState[0]; var setError = errorState[1];
  var uploadingState = useState(false);
  var uploading = uploadingState[0]; var setUploading = uploadingState[1];
  var doneState = useState(false);
  var done = doneState[0]; var setDone = doneState[1];

  var amountState = useState("");
  var amount = amountState[0]; var setAmount = amountState[1];
  var descState = useState("");
  var desc = descState[0]; var setDesc = descState[1];
  var dateState = useState(new Date().toISOString().slice(0, 10));
  var invoiceDate = dateState[0]; var setInvoiceDate = dateState[1];
  var fileState = useState(null);
  var file = fileState[0]; var setFile = fileState[1];
  var statusState = useState(null);
  var uploadStatus = statusState[0]; var setUploadStatus = statusState[1];

  var sb = createClient(SUPABASE_URL, SUPABASE_ANON);

  useEffect(function() {
    if (!token) { setError("Invalid link."); setLoading(false); return; }
    sb.from("suppliers").select("id, name, user_id").eq("token", token).eq("active", true)
      .single()
      .then(function(res) {
        if (res.error || !res.data) { setError("This link is invalid or has been deactivated."); setLoading(false); return; }
        setSupplier(res.data);
        setLoading(false);
      });
  }, [token]);

  function handleFile(e) {
    var f = e.target.files[0];
    if (f) setFile(f);
    e.target.value = "";
  }

  function submit() {
    if (!file && !amount) { setUploadStatus("Please add an invoice file or at least an amount."); return; }
    setUploading(true); setUploadStatus("Uploading...");
    var proceed = function(filePath) {
      var rec = {
        supplier_id: supplier.id,
        user_id: supplier.user_id,
        amount: parseFloat(amount) || 0,
        description: desc,
        invoice_date: invoiceDate,
        file_path: filePath || "",
        status: "unpaid",
        uploaded_at: new Date().toISOString()
      };
      sb.from("supplier_invoices").insert(rec).then(function(res) {
        setUploading(false);
        if (res.error) { setUploadStatus("Error saving invoice. Please try again."); return; }
        setDone(true);
      });
    };
    if (file) {
      var path = supplier.user_id + "/" + supplier.id + "_" + Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
      sb.storage.from("supplier-invoices").upload(path, file, { upsert: false })
        .then(function(res) {
          if (res.error) { setUploadStatus("File upload failed. Saving without attachment."); proceed(""); }
          else proceed(path);
        });
    } else { proceed(""); }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f7fb" }}>
      <div style={{ fontSize: 16, color: "#666" }}>Loading...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f7fb", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 400, textAlign: "center", boxShadow: "0 2px 20px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>{"!"}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#c0392b", marginBottom: 8 }}>Link Invalid</div>
        <div style={{ fontSize: 14, color: "#666" }}>{error}</div>
      </div>
    </div>
  );

  if (done) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f7fb", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 400, textAlign: "center", boxShadow: "0 2px 20px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{"ok"}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#1a7a4a", marginBottom: 8 }}>Invoice Submitted</div>
        <div style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>Your invoice has been received by the yard. You will be contacted regarding payment.</div>
        <button onClick={function() { setDone(false); setAmount(""); setDesc(""); setFile(null); }} style={{ background: "#0a1628", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Submit Another
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", padding: "32px 16px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ background: "#0a1628", borderRadius: 16, padding: "20px 24px", marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#f0c040", marginBottom: 2 }}>RacePlan Pro</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Invoice Submission Portal</div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "24px", boxShadow: "0 2px 20px rgba(0,0,0,0.06)", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0a1628", marginBottom: 4 }}>Welcome, {supplier.name}</div>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>Upload your invoice below. It will be sent directly to the yard.</div>

          <div style={{ marginBottom: 14 }}>
            <div style={lbl}>Invoice Date</div>
            <input type="date" value={invoiceDate} onChange={function(e) { setInvoiceDate(e.target.value); }} style={inp} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={lbl}>Amount (EUR)</div>
            <input type="number" value={amount} onChange={function(e) { setAmount(e.target.value); }} placeholder="0.00" step="0.01" style={inp} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={lbl}>Description</div>
            <input type="text" value={desc} onChange={function(e) { setDesc(e.target.value); }} placeholder="e.g. Farrier visit - 8 horses - June" style={inp} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={lbl}>Invoice File (PDF or photo)</div>
            <label style={{ display: "block", border: "2px dashed #d0d8e4", borderRadius: 10, padding: "16px", textAlign: "center", cursor: "pointer", background: file ? "#f0fdf4" : "#f8fafc" }}>
              <div style={{ fontSize: 13, color: file ? "#1a7a4a" : "#666", fontWeight: file ? 700 : 400 }}>
                {file ? file.name : "Tap to take photo or choose file"}
              </div>
              <input type="file" accept="image/*,application/pdf" onChange={handleFile} style={{ display: "none" }} />
            </label>
          </div>

          {uploadStatus && <div style={{ fontSize: 13, color: "#e67e22", marginBottom: 12 }}>{uploadStatus}</div>}

          <button onClick={submit} disabled={uploading}
            style={{ width: "100%", background: "#0a1628", color: "#fff", border: "none", borderRadius: 10, padding: "14px", fontSize: 16, fontWeight: 700, cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.7 : 1 }}>
            {uploading ? "Submitting..." : "Submit Invoice"}
          </button>
        </div>

        <div style={{ textAlign: "center", fontSize: 11, color: "#999" }}>Powered by RacePlan Pro</div>
      </div>
    </div>
  );
}

var lbl = { fontSize: 11, fontWeight: 700, color: "#666", marginBottom: 5, textTransform: "uppercase" };
var inp = { width: "100%", padding: "10px 12px", border: "1px solid #d0d8e4", borderRadius: 8, fontSize: 14, color: "#0a1628" };

export default SupplierPortal;
