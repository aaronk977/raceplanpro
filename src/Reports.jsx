import React, { useState } from "react";
import { Btn, C } from "./shared";

// Reports - pull date-range reports across all areas, print/PDF each
function Reports({ horses, user, supabase, settings }) {
  var typeState = useState("medicines");
  var reportType = typeState[0]; var setReportType = typeState[1];
  var fromState = useState("");
  var fromDate = fromState[0]; var setFromDate = fromState[1];
  var toStateV = useState("");
  var toDate = toStateV[0]; var setToDate = toStateV[1];
  var horseState = useState("");
  var horseFilter = horseState[0]; var setHorseFilter = horseState[1];
  var dataState = useState([]);
  var data = dataState[0]; var setData = dataState[1];
  var loadingState = useState(false);
  var loading = loadingState[0]; var setLoading = loadingState[1];
  var ranState = useState(false);
  var ran = ranState[0]; var setRan = ranState[1];

  var trainerName = (settings && settings.trainerName) || "";
  var yardName = (settings && settings.yardName) || "";

  var REPORTS = {
    medicines: { table: "medicines_register", label: "Medicines Register", dateCol: "date",
      cols: [["date", "Date"], ["horse_name", "Horse"], ["drug_brand", "Medication"], ["route", "Route"], ["quantity", "Qty"], ["reason", "Reason"], ["administered_by", "By"], ["vet", "Vet"], ["withdrawal_time", "Withdrawal"], ["trainer_auth", "Auth"]] },
    gallops: { table: "gallops", label: "Gallops", dateCol: "date",
      cols: [["date", "Date"], ["horse_name", "Horse"], ["location", "Location"], ["work", "Work"], ["comment", "Comment"]] },
    trotters: { table: "trotters", label: "Trotters / Soundness", dateCol: "date",
      cols: [["date", "Date"], ["horse_name", "Horse"], ["reason", "Reason"], ["outcome", "Outcome"], ["notes", "Notes"]] },
    weights: { table: "horse_weights", label: "Weights", dateCol: "date",
      cols: [["date", "Date"], ["horse_name", "Horse"], ["weight", "Weight (kg)"]] },
    prescriptions: { table: "prescriptions", label: "Prescriptions Log", dateCol: "date",
      cols: [["date", "Date"], ["note", "Note"], ["uploaded_at", "Uploaded"]] },
  };

  function run() {
    if (!user || !supabase) return;
    var cfg = REPORTS[reportType];
    setLoading(true); setRan(false);
    var q = supabase.from(cfg.table).select("*").eq("user_id", user.id);
    q.then(function(res) {
      var rows = res.data || [];
      rows = rows.filter(function(r) {
        var d = r[cfg.dateCol] || "";
        if (fromDate && d < fromDate) return false;
        if (toDate && d > toDate) return false;
        if (horseFilter && r.horse_id !== horseFilter) return false;
        return true;
      });
      rows.sort(function(a, b) { return (a[cfg.dateCol] || "").localeCompare(b[cfg.dateCol] || ""); });
      setData(rows);
      setLoading(false); setRan(true);
    });
  }

  function printReport() {
    var cfg = REPORTS[reportType];
    var style = "@page{size:A4 landscape;margin:1cm} body{font-family:Arial;font-size:10pt;color:#000} h1{font-size:16pt;margin-bottom:2pt} .sub{font-size:10pt;color:#444;margin-bottom:10pt} table{width:100%;border-collapse:collapse;margin-top:8pt} th,td{border:1px solid #333;padding:4pt 6pt;text-align:left;font-size:8.5pt} th{background:#eee}";
    var headRow = cfg.cols.map(function(col) { return "<th>" + col[1] + "</th>"; }).join("");
    var bodyRows = data.map(function(r) {
      return "<tr>" + cfg.cols.map(function(col) {
        var v = r[col[0]] || "";
        if (col[0] === "uploaded_at" && v) v = new Date(v).toLocaleString("en-IE");
        return "<td>" + v + "</td>";
      }).join("") + "</tr>";
    }).join("");
    var horseLabel = "";
    if (horseFilter) { var h = horses.find(function(x) { return x.id === horseFilter; }); horseLabel = h ? " - " + h.name : ""; }
    var win = window.open("", "_blank");
    win.document.write("<html><head><title>" + cfg.label + " Report</title><style>" + style + "</style></head><body>" +
      "<h1>" + cfg.label + " Report" + horseLabel + "</h1>" +
      "<div class='sub'>" + (yardName ? yardName + " - " : "") + (trainerName ? trainerName + " - " : "") + "Period: " + (fromDate || "start") + " to " + (toDate || "today") + " - " + data.length + " records</div>" +
      "<table><tr>" + headRow + "</tr>" + bodyRows + "</table>" +
      "</body></html>");
    win.document.close(); win.focus();
    setTimeout(function() { win.print(); }, 500);
  }

  var cfg = REPORTS[reportType];
  var activeHorses = horses.filter(function(h) { return h.status !== "Retired" && h.status !== "Sold"; });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Reports</div>
        <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>Pull a record for any area and date range. Print or save as PDF.</div>
      </div>

      <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px", marginBottom: 16 }}>
        {/* Report type */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {Object.keys(REPORTS).map(function(k) {
            var active = reportType === k;
            return (
              <button key={k} onClick={function() { setReportType(k); setRan(false); }}
                style={{ padding: "7px 14px", borderRadius: 20, border: "1.5px solid " + (active ? C.navy : C.border), background: active ? C.navy : "transparent", color: active ? "#fff" : C.textMid, fontSize: 13, fontWeight: active ? 700 : 400, cursor: "pointer" }}>
                {REPORTS[k].label}
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div>
            <div style={lblS}>From</div>
            <input type="date" value={fromDate} onChange={function(e) { setFromDate(e.target.value); }} style={inpS} />
          </div>
          <div>
            <div style={lblS}>To</div>
            <input type="date" value={toDate} onChange={function(e) { setToDate(e.target.value); }} style={inpS} />
          </div>
          <div>
            <div style={lblS}>Horse (optional)</div>
            <select value={horseFilter} onChange={function(e) { setHorseFilter(e.target.value); }} style={inpS}>
              <option value="">All horses</option>
              {activeHorses.sort(function(a, b) { return a.name.localeCompare(b.name); }).map(function(h) {
                return <option key={h.id} value={h.id}>{h.name}</option>;
              })}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={run} disabled={loading}>{loading ? "Loading..." : "Run Report"}</Btn>
          {ran && data.length > 0 && <Btn variant="ghost" onClick={printReport}>Print / PDF</Btn>}
        </div>
      </div>

      {/* Results */}
      {ran && (data.length === 0 ? (
        <div style={{ background: C.card, border: "1.5px dashed " + C.border, borderRadius: 12, padding: "40px 20px", textAlign: "center", color: C.textMid, fontSize: 14 }}>
          No records found for this period.
        </div>
      ) : (
        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid " + C.border, fontSize: 13, fontWeight: 700, color: C.navy }}>
            {cfg.label + " - " + data.length + " record" + (data.length !== 1 ? "s" : "")}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {cfg.cols.map(function(col) {
                    return <th key={col[0]} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: C.textMid, textTransform: "uppercase", borderBottom: "1px solid " + C.border, whiteSpace: "nowrap" }}>{col[1]}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {data.map(function(r, i) {
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid " + C.cardOff }}>
                      {cfg.cols.map(function(col) {
                        var v = r[col[0]] || "";
                        if (col[0] === "uploaded_at" && v) v = new Date(v).toLocaleString("en-IE");
                        return <td key={col[0]} style={{ padding: "8px 12px", fontSize: 12, color: C.text }}>{v}</td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

var lblS = { fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase" };
var inpS = { width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text };

export default Reports;
