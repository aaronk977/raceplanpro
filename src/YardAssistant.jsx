import React, { useState, useEffect, useRef } from "react";
import { Btn, C, ANTHROPIC_KEY } from "./shared";

// API_HEADERS removed - using server-side proxy

function YardAssistant({ horses, setHorses, weights, medLogs, setMedLogs, reminders, setReminders, settings, user, supabase, onNavigate }) {
  var todayStr = new Date().toISOString().slice(0, 10);
  var messagesState = useState([]);
  var messages = messagesState[0]; var setMessages = messagesState[1];
  var inputState = useState("");
  var input = inputState[0]; var setInput = inputState[1];
  var loadingState = useState(false);
  var loading = loadingState[0]; var setLoading = loadingState[1];
  var listeningState = useState(false);
  var listening = listeningState[0]; var setListening = listeningState[1];
  var loadedState = useState(false);
  var loaded = loadedState[0]; var setLoaded = loadedState[1];
  var actionsState = useState([]);
  var pendingActions = actionsState[0]; var setPendingActions = actionsState[1];
  var bottomRef = useRef(null);

  var yardName = (settings && settings.yardName) || "the yard";
  var trainerName = (settings && settings.trainerName) || "the trainer";
  var activeHorses = (horses || []).filter(function(h) { return h.status === "Active"; });

  var medTypes = (settings && settings.medications && settings.medications.length > 0)
    ? settings.medications
    : [
        { id: "peptizole", name: "Peptizole" },
        { id: "antepsin", name: "Antepsin" },
        { id: "antibiotics", name: "Antibiotics" }
      ];

  useEffect(function() {
    if (!user || !supabase || loaded) return;
    setLoaded(true);
    supabase.from("yard_logs")
      .select("*").eq("user_id", user.id).eq("log_date", todayStr).eq("category", "assistant")
      .order("created_at", { ascending: true })
      .then(function(res) {
        if (res.data && res.data.length > 0) {
          setMessages(res.data.map(function(r) { return { role: r.role, content: r.content, id: r.id, actions: r.actions }; }));
        } else {
          setMessages([{ role: "assistant", content: "Morning! I'm your yard assistant for " + yardName + ". I know your " + activeHorses.length + " active horses. Tell me what to do - start medication, log vet visits, note anything.", id: "welcome" }]);
        }
      });
  }, [user]);

  useEffect(function() {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function saveMessage(role, content, actions) {
    if (!user || !supabase) return;
    supabase.from("yard_logs").insert({
      user_id: user.id, log_date: todayStr, role: role, content: content, category: "assistant"
    }).then(function(r) { if (r.error) console.error("Log save:", r.error); });
  }

  // Find horse by fuzzy name match
  function findHorse(name) {
    if (!name) return null;
    var nl = name.toLowerCase().trim();
    return (horses || []).find(function(h) {
      var hl = h.name.toLowerCase();
      return hl === nl || hl.indexOf(nl) >= 0 || nl.indexOf(hl) >= 0;
    });
  }

  function getMedId(medName) {
    if (!medName) return null;
    var ml = medName.toLowerCase();
    var found = medTypes.find(function(m) {
      return (m.name || m.label || "").toLowerCase().indexOf(ml) >= 0 || ml.indexOf((m.name || m.label || "").toLowerCase()) >= 0;
    });
    return found ? (found.id || (found.name || "").toLowerCase().replace(/[^a-z0-9]/g, "_")) : null;
  }

  // Execute an action returned from Claude
  function executeAction(action) {
    var horse = action.horseName ? findHorse(action.horseName) : null;

    if (action.type === "start_medication" && horse) {
      var medId = getMedId(action.medication);
      if (!medId) return "Could not find medication: " + action.medication;
      var key = horse.id + "_" + todayStr + "_" + medId;
      setMedLogs(function(prev) { return Object.assign({}, prev, { [key]: 1 }); });
      if (onNavigate) {} // stay on assistant tab
      return horse.name + " - " + action.medication + " started today ✓";
    }

    if (action.type === "stop_medication" && horse) {
      var medId2 = getMedId(action.medication);
      if (!medId2) return "Could not find medication: " + action.medication;
      var key2 = horse.id + "_" + todayStr + "_" + medId2;
      setMedLogs(function(prev) { var n = Object.assign({}, prev); n[key2] = 0; return n; });
      return horse.name + " - " + action.medication + " stopped today ✓";
    }

    if (action.type === "log_daily" ) {
      // Save to yard_logs as a daily entry
      if (user && supabase) {
        supabase.from("yard_logs").insert({
          user_id: user.id, log_date: todayStr,
          role: "system", content: action.note,
          category: action.category || "health",
          horse_id: horse ? horse.id : null
        }).then(function() {});
      }
      return (horse ? horse.name + " - " : "") + "Logged to Daily Summary ✓";
    }

    if (action.type === "update_horse" && horse && action.field) {
      setHorses(function(prev) {
        return prev.map(function(h) {
          if (h.id !== horse.id) return h;
          var update = {};
          update[action.field] = action.value;
          return Object.assign({}, h, update);
        });
      });
      return horse.name + " - " + action.field + " updated to " + action.value + " ✓";
    }

    if (action.type === "set_reminder") {
      var reminder = {
        id: "rem_" + Date.now(),
        text: action.text || action.note,
        date: action.date || new Date().toISOString().slice(0, 10),
        time: action.time || "09:00",
        horseName: action.horseName || "",
        phone: action.phone || ((settings && settings.notifyContacts && settings.notifyContacts[0]) ? settings.notifyContacts[0].phone : ""),
        sendWhatsApp: true,
        fired: false, dismissed: false,
        createdAt: new Date().toISOString()
      };
      if (setReminders) setReminders(function(prev) { return (prev || []).concat([reminder]); });
      // Save to Supabase so it persists in Reminders tab
      if (user && supabase) {
        supabase.from("reminders").upsert({
          id: reminder.id, user_id: user.id,
          text: reminder.text, reminder_date: reminder.date,
          reminder_time: reminder.time || "09:00",
          horse_name: reminder.horseName || "",
          phone: reminder.phone || "", send_whatsapp: true,
          notify_before_hours: 24, max_attempts: 3,
          attempt_count: 0, acknowledged: false, dismissed: false, fired: false
        }, { onConflict: "id" }).then(function(r) {
          if (r.error) console.error("Reminder save error:", r.error.message);
          else console.log("Reminder saved to Supabase OK");
        });
      }
      return "Reminder set for " + reminder.date + " at " + reminder.time + ": " + reminder.text;
    }

    if (action.type === "navigate" && onNavigate) {
      var tabMap = { medications: "meds", "daily summary": "summary", whiteboard: "whiteboard", "race planner": "races", weights: "weights", reminders: "reminders" };
      var tab = tabMap[action.tab] || action.tab;
      onNavigate(tab);
      return "Opening " + action.tab + "...";
    }

    return null;
  }

  function buildSystemPrompt() {
    var horseList = activeHorses.slice(0, 30).map(function(h) {
      var prov = (h.provisionalEntries || []).map(function(e) { return e.raceName + " " + e.date; }).join(", "); return h.name + " (" + (h.sex || "") + ", OR: " + (h.nhRating || h.flatRating || "?") + (prov ? ", targets: " + prov : "") + ")";
    }).join("; ");
    var medList = medTypes.map(function(m) { return (m.name || m.label) + " (" + (m.courseDays || 12) + "d course, " + (m.withdrawalDays != null ? m.withdrawalDays : 4) + "d withdrawal)"; }).join(", ");
    return [
      "You are the AI yard assistant for " + yardName + ", trainer: " + trainerName + ".",
      "Active horses with provisional targets: " + (horseList || "none") + ".",
      "Available medications: " + medList + " (each listed with course days + withdrawal days).",
      "Today: " + new Date().toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + ".",
      "IMPORTANT: When asked to DO something (start/stop medication, log a vet visit, note something about a horse), respond with your message AND a JSON actions array.",
      "Format: respond normally then add on a new line: ACTIONS:[{...}]",
      "Action types:",
      '{ "type": "start_medication", "horseName": "Horse Name", "medication": "Peptizole" }',
      '{ "type": "stop_medication", "horseName": "Horse Name", "medication": "Peptizole" }',
      '{ "type": "log_daily", "horseName": "Horse Name", "note": "vet to check heart", "category": "health" }',
      '{ "type": "log_daily", "horseName": "", "note": "general yard note", "category": "general" }',
      '{ "type": "update_horse", "horseName": "Horse Name", "field": "notes", "value": "note text" }',
      '{ "type": "set_reminder", "text": "reminder text", "date": "YYYY-MM-DD", "time": "HH:MM", "horseName": "" }',
      '{ "type": "navigate", "tab": "medications" }',
      "For reminders: extract date and time from natural language. Monday=next monday, Tuesday=next tuesday etc.",
      "If no time mentioned use 09:00. Always set a reminder for remind me/dont forget/remember requests.",
      "Keep reminder text exactly as the user said it - do not add words like send push notification re.",
      "After setting a reminder just say: Done - reminder set for [day] at [time].",
      "Categories: health, gallop, racing, farrier, general.",
      "Match horse names loosely - if someone says Butch just match Butch Cassidy etc.",
      "If no action needed, just respond normally without ACTIONS.",
      "MEDICATION TIMING: To run in a race, horse must FINISH medication at least [withdrawalDays] days before. Course takes [courseDays] days. So START = race date minus (courseDays + withdrawalDays - 1). FINISH = race date minus withdrawalDays. E.g. Peptizole 12d course 4d withdrawal: for a race on 6 Jun, FINISH by 2 Jun, START by 22 May (inclusive counting - day 1 of course counts as the start day). Never say start 3-4 days before - that is completely wrong.",
      "Be brief and practical."
    ].join(" ");
  }

  var sendMessage = async function() {
    if (!input.trim() || loading) return;
    var userText = input.trim();
    var userMsg = { role: "user", content: userText, id: "u_" + Date.now() };
    setMessages(function(prev) { return prev.concat([userMsg]); });
    saveMessage("user", userText);
    setInput("");
    setLoading(true);

    try {
      var history = messages.filter(function(m) { return m.id !== "welcome"; })
        .concat([userMsg]).slice(-12)
        .map(function(m) { return { role: m.role, content: m.content }; });

      var res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 600,
          system: buildSystemPrompt(),
          messages: history
        })
      });
      var data = await res.json();
      var txt = (data.content || []).filter(function(b) { return b.type === "text"; }).map(function(b) { return b.text; }).join("");

      // Parse out ACTIONS if present
      var displayText = txt;
      var actionResults = [];
      var actionsMatch = txt.indexOf("ACTIONS:");
      if (actionsMatch >= 0) {
        displayText = txt.slice(0, actionsMatch).trim();
        var actionsStr = txt.slice(actionsMatch + 8).trim();
        try {
          var s = actionsStr.indexOf("["); var e = actionsStr.lastIndexOf("]");
          if (s >= 0 && e > s) {
            var actions = JSON.parse(actionsStr.slice(s, e + 1));
            actions.forEach(function(action) {
              var result = executeAction(action);
              if (result) actionResults.push(result);
            });
          }
        } catch (err) { console.error("Action parse error:", err); }
      }

      // Build response message with action confirmations
      var finalText = displayText.trim();
      if (actionResults.length > 0) {
        finalText = (finalText ? finalText + "\n\n" : "") + "Done:\n" + actionResults.map(function(r) { return "✓ " + r; }).join("\n");
      }

      // Don't add blank bubble
      if (!finalText || !finalText.trim()) {
        finalText = actionResults.length > 0 ? "Done: " + actionResults.join(", ") : "...";
      }
      var aMsg = { role: "assistant", content: finalText, id: "a_" + Date.now(), hasActions: actionResults.length > 0 };
      setMessages(function(prev) { return prev.concat([aMsg]); });
      saveMessage("assistant", finalText);

    } catch (err) {
      console.error(err);
      setMessages(function(prev) { return prev.concat([{ role: "assistant", content: "Connection error. Check API key in Yard Settings.", id: "err_" + Date.now() }]); });
    }
    setLoading(false);
  };

  function startListening() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice input needs Chrome browser."); return; }
    var recognition = new SR();
    recognition.lang = "en-IE";
    recognition.interimResults = false;
    setListening(true);
    recognition.start();
    recognition.onresult = function(e) { setInput(e.results[0][0].transcript); setListening(false); };
    recognition.onerror = function() { setListening(false); };
    recognition.onend = function() { setListening(false); };
  }

  function clearToday() {
    if (!window.confirm("Clear today's conversation?")) return;
    setMessages([{ role: "assistant", content: "Fresh start. What do you need?", id: "fresh_" + Date.now() }]);
    if (user && supabase) {
      supabase.from("yard_logs").delete().eq("user_id", user.id).eq("log_date", todayStr).eq("category", "assistant").then(function() {});
    }
  }

  var QUICK_PROMPTS = [
    "Start Adaliz on Peptizole today",
    "Vet to see Butch Cassidy - check heart",
    "Log: all horses worked well this morning",
    "Stop Peptizole on Desert Crown",
    "Book farrier for next Thursday",
    "What horses are on medication today?",
    "Remind me owners visiting Thursday at 2pm"
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Yard Assistant</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 2 }}>
            {"Speak or type - I can start/stop medication, log vet visits, update horses and more"}
          </div>
        </div>
        <Btn variant="ghost" onClick={clearToday} style={{ fontSize: 11, padding: "6px 12px" }}>Clear Today</Btn>
      </div>

      <div style={{ height: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4, marginBottom: 8, WebkitOverflowScrolling: "touch" }}>
        {messages.map(function(msg) {
          var isUser = msg.role === "user";
          return (
            <div key={msg.id} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "82%", padding: "11px 15px",
                borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                background: isUser ? C.navy : C.card,
                border: isUser ? "none" : "1px solid " + (msg.hasActions ? C.green : C.border),
                color: isUser ? "#fff" : C.text, fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                {!isUser && (
                  <div style={{ fontSize: 9, fontWeight: 700, color: msg.hasActions ? C.green : C.gold, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
                    {msg.hasActions ? "✓ Action taken" : "Yard Assistant"}
                  </div>
                )}
                {msg.content}
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "11px 15px", borderRadius: "4px 18px 18px 18px", background: C.card, border: "1px solid " + C.border }}>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, opacity: 0.9 }} />
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, opacity: 0.6 }} />
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, opacity: 0.3 }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div style={{ marginBottom: 10, flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>Try saying...</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {QUICK_PROMPTS.map(function(prompt) {
              return (
                <button key={prompt} onClick={function() { setInput(prompt); }}
                  style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid " + C.border, background: C.card, color: C.textMid, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                  {prompt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, alignItems: "flex-end", flexShrink: 0, minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <textarea value={input} onChange={function(e) { setInput(e.target.value); }}
            onKeyDown={function(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={"Ask anything or say: Start [horse] on Peptizole"}
            rows={2}
            style={{ width: "100%", padding: "10px 12px", background: C.card, border: "1.5px solid " + C.border, borderRadius: 12, fontSize: 14, color: C.text, resize: "none", lineHeight: 1.5, boxSizing: "border-box" }} />
        </div>
        <button onClick={startListening} disabled={listening}
          style={{ width: 42, height: 42, borderRadius: 12, border: "1.5px solid " + (listening ? C.red : C.border), background: listening ? C.red + "15" : C.card, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {listening ? "🔴" : "🎤"}
        </button>
        <button onClick={sendMessage} disabled={!input.trim() || loading}
          style={{ height: 42, padding: "0 14px", borderRadius: 12, flexShrink: 0, background: (!input.trim() || loading) ? C.border : C.navy, color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default YardAssistant;
