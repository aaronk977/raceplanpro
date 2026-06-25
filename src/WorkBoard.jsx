import React, { useState, useEffect } from "react";
import { Btn, C } from "./shared";

function WorkBoard({ horses, user, supabase, settings }) {
  var now = new Date();
  var todayStr = now.toISOString().slice(0, 10);

  var dateState = useState(todayStr);
  var boardDate = dateState[0]; var setBoardDate = dateState[1];
  var boardState = useState(null);
  var board = boardState[0]; var setBoard = boardState[1];
  var loadingState = useState(true);
  var loading = loadingState[0]; var setLoading = loadingState[1];
  var savingState = useState(false);
  var saving = savingState[0]; var setSaving = savingState[1];
  var assignState = useState(null);
  var assignTo = assignState[0]; var setAssignTo = assignState[1];
  var newRiderState = useState("");
  var newRider = newRiderState[0]; var setNewRider = newRiderState[1];
  var numLotsState = useState(3);
  var numLots = numLotsState[0]; var setNumLots = numLotsState[1];
  var toastState = useState(null);
  var toast = toastState[0]; var setToast = toastState[1];
  var linkState = useState("");
  var riderLink = linkState[0]; var setRiderLink = linkState[1];

  // Seed riders from notify contacts (riders/staff) if available
  function seedRiders() {
    var contacts = (settings && settings.notifyContacts) || [];
    var riders = contacts.filter(function(c) {
      var r = (c.role || "").toLowerCase();
      return r.indexOf("rider") >= 0 || r.indexOf("lad") >= 0 || r.indexOf("work") >= 0 || r.indexOf("staff") >= 0;
    }).map(function(c) { return { name: c.name, lots: {} }; });
    return riders;
  }

  function emptyBoard() {
    return { date: boardDate, numLots: 3, riders: seedRiders() };
  }

  function showToast(msg, color) {
    setToast({ msg: msg, color: color || C.green });
    setTimeout(function() { setToast(null); }, 2500);
  }

  useEffect(function() {
    if (!user || !supabase) { setLoading(false); return; }
    setLoading(true);
    supabase.from("work_boards").select("*").eq("user_id", user.id).eq("board_date", boardDate).maybeSingle()
      .then(function(res) {
        if (res.data && res.data.board_data) {
          // This date already has a saved board - use it
          var bd = typeof res.data.board_data === "string" ? JSON.parse(res.data.board_data) : res.data.board_data;
          setBoard(bd);
          setNumLots(bd.numLots || 3);
          setLoading(false);
        } else {
          // New date - build the roster from the MOST RECENT board's riders (so all
          // riders persist across dates) merged with any settings contacts, lots cleared.
          supabase.from("work_boards").select("board_data").eq("user_id", user.id)
            .order("board_date", { ascending: false }).limit(1)
            .then(function(recent) {
              var roster = [];
              var names = {};
              // Riders from the most recent saved board
              if (recent.data && recent.data[0] && recent.data[0].board_data) {
                var lastBd = typeof recent.data[0].board_data === "string" ? JSON.parse(recent.data[0].board_data) : recent.data[0].board_data;
                (lastBd.riders || []).forEach(function(r) {
                  if (r.name && !names[r.name.toLowerCase()]) {
                    names[r.name.toLowerCase()] = true;
                    roster.push({ name: r.name, lots: {} });
                  }
                });
              }
              // Plus any rider/staff contacts from settings not already in the roster
              seedRiders().forEach(function(r) {
                if (r.name && !names[r.name.toLowerCase()]) {
                  names[r.name.toLowerCase()] = true;
                  roster.push({ name: r.name, lots: {} });
                }
              });
              var nb = { date: boardDate, numLots: 3, riders: roster };
              setBoard(nb);
              setNumLots(3);
              setLoading(false);
            });
        }
      });
  }, [boardDate, user]);

  function saveBoard() {
    if (!user || !supabase || !board) return;
    setSaving(true);
    var payload = Object.assign({}, board, { date: boardDate, numLots: numLots });
    supabase.from("work_boards").upsert({
      user_id: user.id, board_date: boardDate, board_data: payload, updated_at: new Date().toISOString()
    }, { onConflict: "user_id,board_date" }).then(function(res) {
      setSaving(false);
      if (res.error) { showToast("Save failed", C.red); }
      else { showToast("Board saved", C.green); }
    });
  }


  function makeRiderLink() {
    if (!user || !supabase) return;
    var yardName = (settings && settings.yardName) || "the yard";
    supabase.from("work_board_links").select("token").eq("user_id", user.id).maybeSingle()
      .then(function(res) {
        if (res.data && res.data.token) {
          var url = window.location.origin + "/?rider=" + res.data.token;
          setRiderLink(url);
          copyLink(url);
        } else {
          var token = "wb_" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
          supabase.from("work_board_links").insert({ user_id: user.id, yard_name: yardName, token: token, active: true })
            .then(function(r2) {
              if (!r2.error) {
                var url = window.location.origin + "/?rider=" + token;
                setRiderLink(url);
                copyLink(url);
              } else {
                showToast("Could not create link", C.red);
              }
            });
        }
      });
  }

  function copyLink(url) {
    try {
      navigator.clipboard.writeText(url).then(function() { showToast("Rider link copied", C.green); });
    } catch (e) {
      showToast("Link ready below", C.green);
    }
  }

  function addRider() {
    if (!newRider.trim()) return;
    setBoard(function(b) {
      var nb = Object.assign({}, b);
      nb.riders = (b.riders || []).concat({ name: newRider.trim(), lots: {} });
      return nb;
    });
    setNewRider("");
  }

  function removeRider(idx) {
    if (!window.confirm("Remove this rider from the board?")) return;
    setBoard(function(b) {
      var nb = Object.assign({}, b);
      nb.riders = b.riders.filter(function(r, i) { return i !== idx; });
      return nb;
    });
  }

  function setRiderNote(riderIdx, note) {
    setBoard(function(b) {
      var nb = Object.assign({}, b);
      nb.riders = b.riders.map(function(r, i) {
        if (i !== riderIdx) return r;
        return Object.assign({}, r, { note: note });
      });
      return nb;
    });
  }

  function assignHorse(riderIdx, lotNum, horseName) {
    setBoard(function(b) {
      var nb = Object.assign({}, b);
      nb.riders = b.riders.map(function(r, i) {
        if (i !== riderIdx) return r;
        var lots = Object.assign({}, r.lots);
        if (horseName) lots[lotNum] = horseName; else delete lots[lotNum];
        return Object.assign({}, r, { lots: lots });
      });
      return nb;
    });
    setAssignTo(null);
  }

  var horseNames = (horses || []).filter(function(h) { return h.status !== "Inactive"; })
    .map(function(h) { return h.name; }).sort();

  // Which horses are already assigned somewhere (to grey them out)
  var assignedSet = {};
  if (board) {
    (board.riders || []).forEach(function(r) {
      Object.keys(r.lots || {}).forEach(function(k) { assignedSet[r.lots[k]] = true; });
    });
  }

  var lotsArr = [];
  for (var i = 1; i <= numLots; i++) lotsArr.push(i);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: C.textMid }}>Loading board...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Work Riding Board</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Set the lots for each rider. Riders see their own board on their phone.</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn variant="ghost" onClick={makeRiderLink}>Rider Link</Btn>
          <Btn onClick={saveBoard} disabled={saving}>{saving ? "Saving..." : "Save Board"}</Btn>
        </div>
      </div>

      {riderLink && (
        <div style={{ background: C.goldBg, border: "1px solid " + C.gold, borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Rider link (share with your riders - they pick their name and see their lots):</div>
          <div style={{ fontSize: 12, color: C.blue, wordBreak: "break-all" }}>{riderLink}</div>
        </div>
      )}
      <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 14, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Date</div>
          <input type="date" value={boardDate} onChange={function(e) { setBoardDate(e.target.value); }}
            style={{ padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Number of lots</div>
          <select value={numLots} onChange={function(e) { setNumLots(parseInt(e.target.value)); }}
            style={{ padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
            {[1,2,3,4,5,6].map(function(n) { return <option key={n} value={n}>{n}</option>; })}
          </select>
        </div>
      </div>

      {/* The board grid */}
      <div style={{ overflowX: "auto", border: "1px solid " + C.border, borderRadius: 12, background: C.card }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 120 + numLots * 130 }}>
          <thead>
            <tr style={{ background: C.navy }}>
              <th style={{ padding: "12px 14px", textAlign: "left", color: "#fff", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, position: "sticky", left: 0, background: C.navy, minWidth: 110 }}>Rider</th>
              {lotsArr.map(function(lot) {
                return <th key={lot} style={{ padding: "12px 14px", textAlign: "left", color: C.gold, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, minWidth: 120 }}>{"Lot " + lot}</th>;
              })}
              <th style={{ width: 40 }}></th>
            <th style={{ padding: "12px 14px", textAlign: "left", color: C.gold, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, minWidth: 160 }}>Note</th>
              <th style={{ width: 30 }}></th>
            </tr>
          </thead>
          <tbody>
            {(board && board.riders || []).map(function(rider, ri) {
              return (
                <tr key={ri} style={{ borderTop: "1px solid " + C.border }}>
                  <td style={{ padding: "10px 14px", fontWeight: 700, fontSize: 14, color: C.text, position: "sticky", left: 0, background: C.card, borderRight: "1px solid " + C.border }}>{rider.name}</td>
                  {lotsArr.map(function(lot) {
                    var assigned = (rider.lots || {})[lot];
                    return (
                      <td key={lot} style={{ padding: "6px 8px", borderRight: "1px solid " + C.border }}>
                        <button onClick={function() { setAssignTo({ riderIdx: ri, lot: lot }); }}
                          style={{ width: "100%", minHeight: 38, padding: "8px 10px", borderRadius: 8, border: "1.5px " + (assigned ? "solid " + C.gold : "dashed " + C.border), background: assigned ? C.goldBg : C.cardOff, color: assigned ? C.navy : C.textMid, fontSize: 13, fontWeight: assigned ? 700 : 400, cursor: "pointer", textAlign: "left" }}>
                          {assigned || "+ assign"}
                        </button>
                      </td>
                    );
                  })}
                  <td style={{ padding: "6px 8px", minWidth: 160 }}>
                    <input type="text" value={rider.note || ""} onChange={function(e) { setRiderNote(ri, e.target.value); }}
                      placeholder="Note for rider..."
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 12, color: C.text, background: C.cardOff }} />
                  </td>
                  <td style={{ padding: "6px 4px", textAlign: "center" }}>
                    <button onClick={function() { removeRider(ri); }} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 16 }}>{"\u00d7"}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add rider */}
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <input type="text" value={newRider} onChange={function(e) { setNewRider(e.target.value); }}
          placeholder="Add a rider's name"
          onKeyDown={function(e) { if (e.key === "Enter") addRider(); }}
          style={{ flex: 1, minWidth: 160, padding: "10px 14px", border: "1px solid " + C.border, borderRadius: 8, fontSize: 14, color: C.text, background: C.cardOff }} />
        <Btn onClick={addRider}>+ Add Rider</Btn>
      </div>

      {(board && (board.riders || []).length === 0) && (
        <div style={{ padding: 30, textAlign: "center", color: C.textMid, fontSize: 13, marginTop: 12, border: "1.5px dashed " + C.border, borderRadius: 12 }}>
          Add your riders above to start building the board. Tip: set roles to "Rider" or "Work Rider" in Settings and they'll appear here automatically.
        </div>
      )}

      {/* Horse assignment picker modal */}
      {assignTo && (
        <div onClick={function() { setAssignTo(null); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{ background: "#fff", borderRadius: "16px 16px 0 0", padding: "20px", maxWidth: 480, width: "100%", maxHeight: "70vh", overflowY: "auto" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 4 }}>{"Assign a horse - Lot " + assignTo.lot}</div>
            <div style={{ fontSize: 13, color: C.textMid, marginBottom: 14 }}>{(board.riders[assignTo.riderIdx] || {}).name}</div>
            <button onClick={function() { assignHorse(assignTo.riderIdx, assignTo.lot, ""); }}
              style={{ width: "100%", padding: "10px", marginBottom: 8, borderRadius: 8, border: "1px solid " + C.border, background: C.cardOff, color: C.red, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Clear this slot
            </button>
            {horseNames.map(function(name) {
              var taken = assignedSet[name];
              return (
                <button key={name} onClick={function() { assignHorse(assignTo.riderIdx, assignTo.lot, name); }}
                  style={{ width: "100%", padding: "12px 14px", marginBottom: 6, borderRadius: 8, border: "1px solid " + C.border, background: taken ? C.cardOff : "#fff", color: taken ? C.textMid : C.text, fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between" }}>
                  <span>{name}</span>
                  {taken && <span style={{ fontSize: 11, color: C.amber }}>already assigned</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: C.navy, padding: "10px 22px", borderRadius: 24, fontSize: 13, fontWeight: 600, zIndex: 99999 }}>
          <span style={{ color: toast.color }}>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

export default WorkBoard;
