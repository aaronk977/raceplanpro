import React, { useState, useEffect } from "react";
import { Btn, C } from "./shared";

function Invoices({ user, supabase }) {
  var suppliersState = useState([]);
  var suppliers = suppliersState[0]; var setSuppliers = suppliersState[1];
  var invoicesState = useState([]);
  var invoices = invoicesState[0]; var setInvoices = invoicesState[1];
  var viewState = useState("invoices");
  var view = viewState[0]; var setView = viewState[1];
  var newNameState = useState("");
  var newName = newNameState[0]; var setNewName = newNameState[1];
  var addingState = useState(false);
  var adding = addingState[0]; var setAdding = addingState[1];
  var filterState = useState("unpaid");
  var filter = filterState[0]; var setFilter = filterState[1];
  var copiedState = useState(null);
  var copied = copiedState[0]; var setCopied = copiedState[1];
  var viewImgState = useState(null);
  var viewImg = viewImgState[0]; var setViewImg = viewImgState[1];

  var BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(function() {
    if (!user || !supabase) return;
    supabase.from("suppliers").select("*").eq("user_id", user.id).order("name")
      .then(function(res) { if (res.data) setSuppliers(res.data); });
    supabase.from("supplier_invoices").select("*, suppliers(name)").eq("user_id", user.id)
      .order("uploaded_at", { ascending: false })
      .then(function(res) { if (res.data) setInvoices(res.data); });
  }, [user]);

  function addSupplier() {
    if (!newName.trim()) return;
    setAdding(true);
    var token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Date.now().toString(36);
    var rec = { user_id: user.id, name: newName.trim(), token: token, active: true, created_at: new Date().toISOString() };
    supabase.from("suppliers").insert(rec).select().then(function(res) {
      if (res.data) setSuppliers(function(p) { return p.concat(res.data); });
      setNewName(""); setAdding(false);
    });
  }

  function deactivate(id) {
    if (!window.confirm("Deactivate this supplier link? They will no longer be able to submit invoices.")) return;
    setSuppliers(function(p) { return p.map(function(s) { return s.id === id ? Object.assign({}, s, { active: false }) : s; }); });
    supabase.from("suppliers").update({ active: false }).eq("id", id).then(function() {});
  }

  function copyLink(token) {
    var link = BASE_URL + "/supplier?token=" + token;
    navigator.clipboard.writeText(link).then(function() { setCopied(token); setTimeout(function() { setCopied(null); }, 2000); });
  }

  function updateStatus(id, status) {
    setInvoices(function(p) { return p.map(function(i) { return i.id === id ? Object.assign({}, i, { status: status }) : i; }); });
    supabase.from("supplier_invoices").update({ status: status }).eq("id", id).then(function() {});
  }

  async function viewFile(filePath) {
    if (!filePath) return;
    var res = await supabase.storage.from("supplier-invoices").createSignedUrl(filePath, 3600);
    if (res.data) {
      var isPdf = filePath.toLowerCase().indexOf(".pdf") >= 0;
      if (isPdf) window.open(res.data.signedUrl, "_blank");
      else setViewImg(res.data.signedUrl);
    }
  }

  var unpaidCount = invoices.filter(function(i) { return i.status === "unpaid"; }).length;
  var filtered = invoices.filter(function(i) { return filter === "all" || i.status === filter; });

  var STATUS_COLORS = { unpaid: C.red, paid: C.green, queried: C.amber };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Invoices</div>
          {unpaidCount > 0 && <div style={{ fontSize: 12, color: C.red, fontWeight: 700, marginTop: 2 }}>{unpaidCount + " unpaid invoice" + (unpaidCount !== 1 ? "s" : "") + " outstanding"}</div>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant={view === "invoices" ? "primary" : "ghost"} onClick={function() { setView("invoices"); }}>Invoices</Btn>
          <Btn variant={view === "suppliers" ? "primary" : "ghost"} onClick={function() { setView("suppliers"); }}>Manage Suppliers</Btn>
        </div>
      </div>

      {view === "suppliers" && (
        <div>
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 10 }}>Add a supplier</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="text" value={newName} onChange={function(e) { setNewName(e.target.value); }}
                onKeyDown={function(e) { if (e.key === "Enter") addSupplier(); }}
                placeholder="e.g. Joe Smith Farrier, ABC Feed, Vet Practice..."
                style={{ flex: 1, padding: "9px 12px", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
              <Btn onClick={addSupplier} disabled={adding || !newName.trim()}>Add</Btn>
            </div>
            <div style={{ fontSize: 12, color: C.textMid, marginTop: 8 }}>Each supplier gets a unique permanent link. They use it to submit invoices for the duration of your relationship.</div>
          </div>

          {suppliers.filter(function(s) { return s.active; }).map(function(s) {
            var link = BASE_URL + "/supplier?token=" + s.token;
            return (
              <div key={s.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{s.name}</div>
                  <button onClick={function() { deactivate(s.id); }} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 12 }}>Deactivate</button>
                </div>
                <div style={{ fontSize: 11, color: C.textMid, marginTop: 4, marginBottom: 8, wordBreak: "break-all" }}>{link}</div>
                <button onClick={function() { copyLink(s.token); }}
                  style={{ background: copied === s.token ? C.green : C.navy, color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {copied === s.token ? "Copied!" : "Copy Link"}
                </button>
                <span style={{ fontSize: 11, color: C.textMid, marginLeft: 10 }}>
                  {invoices.filter(function(i) { return i.supplier_id === s.id; }).length + " invoice(s) received"}
                </span>
              </div>
            );
          })}

          {suppliers.filter(function(s) { return !s.active; }).length > 0 && (
            <div style={{ fontSize: 12, color: C.textMid, marginTop: 8 }}>
              {suppliers.filter(function(s) { return !s.active; }).length + " deactivated supplier(s) not shown"}
            </div>
          )}
        </div>
      )}

      {view === "invoices" && (
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {["unpaid","paid","queried","all"].map(function(f) {
              var count = f === "all" ? invoices.length : invoices.filter(function(i) { return i.status === f; }).length;
              return (
                <button key={f} onClick={function() { setFilter(f); }}
                  style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid " + (filter === f ? (STATUS_COLORS[f] || C.navy) : C.border), background: filter === f ? (STATUS_COLORS[f] || C.navy) + "15" : "transparent", color: filter === f ? (STATUS_COLORS[f] || C.navy) : C.textMid, fontSize: 12, fontWeight: filter === f ? 700 : 400, cursor: "pointer" }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)} {count > 0 ? "(" + count + ")" : ""}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div style={{ background: C.card, border: "1.5px dashed " + C.border, borderRadius: 12, padding: "40px 20px", textAlign: "center", color: C.textMid, fontSize: 14 }}>
              No {filter} invoices. Add suppliers in Manage Suppliers to get their link.
            </div>
          ) : (
            filtered.map(function(inv) {
              var supplierName = (inv.suppliers && inv.suppliers.name) || "Unknown Supplier";
              return (
                <div key={inv.id} style={{ background: C.card, border: "1px solid " + (inv.status === "unpaid" ? C.red + "30" : C.border), borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{supplierName}</div>
                      <div style={{ fontSize: 12, color: C.textMid }}>{new Date(inv.invoice_date || inv.uploaded_at).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: C.navy }}>{inv.amount > 0 ? "EUR" + Number(inv.amount).toFixed(2) : "-"}</div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLORS[inv.status] || C.textMid, background: (STATUS_COLORS[inv.status] || C.textMid) + "15", padding: "2px 8px", borderRadius: 10 }}>{inv.status}</span>
                    </div>
                  </div>
                  {inv.description && <div style={{ fontSize: 13, color: C.text, marginBottom: 8 }}>{inv.description}</div>}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    {inv.file_path && (
                      <button onClick={function() { viewFile(inv.file_path); }} style={{ background: C.cardOff, border: "1px solid " + C.border, borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", color: C.navy, fontWeight: 600 }}>
                        View Invoice
                      </button>
                    )}
                    {["unpaid","paid","queried"].map(function(s) {
                      if (s === inv.status) return null;
                      return (
                        <button key={s} onClick={function() { updateStatus(inv.id, s); }}
                          style={{ background: STATUS_COLORS[s] + "15", border: "1px solid " + STATUS_COLORS[s] + "40", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", color: STATUS_COLORS[s], fontWeight: 600 }}>
                          Mark {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {viewImg && (
        <div onClick={function() { setViewImg(null); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <img src={viewImg} alt="invoice" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
}

export default Invoices;
