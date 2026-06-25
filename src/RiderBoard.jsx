import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { C } from "./shared";

// Public rider page - reached via ?rider=TOKEN
// Rider picks their name and sees only their own lots for the day. No login.

var SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
var SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

function RiderBoard({ token }) {
  var yardState = useState(null);
  var yard = yardState[0]; var setYard = yardState[1];
  var loadingState = useState(true);
  var loading = loadingState[0]; var setLoading = loadingState[1];
  var errorState = useState(null);
  var error = errorState[0]; var setError = errorState[1];
  var dateState = useState(new Date().toISOString().slice(0, 10));
  var boardDate = dateState[0]; var setBoardDate = dateState[1];
  var boardState = useState(null);
  var board = boardState[0]; var setBoard = boardState[1];
  var pickedState = useState(null);
  var picked = pickedState[0]; var setPicked = pickedState[1];

  var sb = createClient(SUPABASE_URL, SUPABASE_ANON);

  useEffect(function() {
    if (!token) { setError("Invalid link."); setLoading(false); return; }
    sb.from("work_board_links").select("user_id, yard_name").eq("token", token).eq("active", true).single()
      .then(function(res) {
        if (res.error || !res.data) { setError("This link is invalid or has been turned off."); setLoading(false); return; }
        setYard(res.data);
        loadBoard(res.data.user_id, boardDate);
      });
  }, [token]);

  function loadBoard(userId, date) {
    setLoading(true);
    sb.from("work_boards").select("board_data").eq("user_id", userId).eq("board_date", date).maybeSingle()
      .then(function(res) {
        if (res.data && res.data.board_data) {
          var bd = typeof res.data.board_data === "string" ? JSON.parse(res.data.board_data) : res.data.board_data;
          setBoard(bd);
        } else {
          setBoard(null);
        }
        setLoading(false);
      });
  }

  function changeDate(d) {
    setBoardDate(d);
    setPicked(null);
    if (yard) loadBoard(yard.user_id, d);
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

  var riders = (board && board.riders) || [];
  var numLots = (board && board.numLots) || 3;
  var lotsArr = [];
  for (var i = 1; i <= numLots; i++) lotsArr.push(i);

  var myRow = picked ? riders.find(function(r) { return r.name === picked; }) : null;

  var prettyDate = new Date(boardDate + "T12:00:00").toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "24px 16px" }}>
      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        <div style={{ background: C.navy, borderRadius: "14px 14px 0 0", padding: "20px 24px" }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>Your Lots</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 3 }}>{yard ? yard.yard_name : ""}</div>
        </div>
        <div style={{ background: C.card, border: "1px solid " + C.border, borderTop: "none", borderRadius: "0 0 14px 14px", padding: "20px 24px" }}>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Date</div>
            <input type="date" value={boardDate} onChange={function(e) { changeDate(e.target.value); }}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid " + C.border, borderRadius: 8, fontSize: 14, color: C.text, background: C.cardOff }} />
          </div>

          {!board && (
            <div style={{ padding: 30, textAlign: "center", color: C.textMid, fontSize: 14, border: "1.5px dashed " + C.border, borderRadius: 12 }}>
              No board set for {prettyDate} yet. Check back later.
            </div>
          )}

          {board && !picked && (
            <div>
              <div style={{ fontSize: 13, color: C.textMid, marginBottom: 12 }}>Tap your name to see your lots for {prettyDate}:</div>
              {riders.map(function(r, i) {
                return (
                  <button key={i} onClick={function() { setPicked(r.name); }}
                    style={{ width: "100%", padding: "14px 16px", marginBottom: 8, borderRadius: 10, border: "1px solid " + C.border, background: C.cardOff, color: C.navy, fontSize: 16, fontWeight: 700, cursor: "pointer", textAlign: "left" }}>
                    {r.name}
                  </button>
                );
              })}
              {riders.length === 0 && (
                <div style={{ padding: 20, textAlign: "center", color: C.textMid, fontSize: 13 }}>No riders on the board yet.</div>
              )}
            </div>
          )}

          {board && picked && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C.navy }}>{picked}</div>
                  <div style={{ fontSize: 12, color: C.textMid }}>{prettyDate}</div>
                </div>
                <button onClick={function() { setPicked(null); }}
                  style={{ fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 7, border: "1px solid " + C.border, background: C.cardOff, color: C.textMid, cursor: "pointer" }}>
                  Not you?
                </button>
              </div>

              {myRow && myRow.note && (
                <div style={{ background: C.goldBg, border: "1px solid " + C.gold, borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Note from the yard</div>
                  <div style={{ fontSize: 14, color: C.text }}>{myRow.note}</div>
                </div>
              )}
              {lotsArr.map(function(lot) {
                var horse = (myRow && myRow.lots && myRow.lots[lot]) || "";
                return (
                  <div key={lot} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", marginBottom: 8, borderRadius: 10, border: "1px solid " + (horse ? C.gold : C.border), background: horse ? C.goldBg : C.cardOff }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: C.textMid, textTransform: "uppercase", letterSpacing: 0.5, minWidth: 46 }}>{"Lot " + lot}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: horse ? C.navy : C.textMid }}>{horse || "-"}</div>
                  </div>
                );
              })}

              {(!myRow || !myRow.lots || Object.keys(myRow.lots).length === 0) && (
                <div style={{ padding: 16, textAlign: "center", color: C.textMid, fontSize: 13, marginTop: 4 }}>
                  No lots assigned to you yet for this day.
                </div>
              )}
            </div>
          )}

          <div style={{ fontSize: 11, color: C.textMid, marginTop: 16, textAlign: "center", lineHeight: 1.5 }}>
            Lots are set by the yard and can change. Check back the morning of.
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiderBoard;
